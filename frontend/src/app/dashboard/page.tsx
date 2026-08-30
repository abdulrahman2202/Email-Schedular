"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import EmailTable from "@/components/emails/EmailTable";
import EmailDetail from "@/components/emails/EmailDetail";
import ComposePage from "@/components/emails/ComposePage";
import Toast from "@/components/ui/Toast";
import { useScheduledEmails, useSentEmails, useSearchEmails } from "@/hooks/useEmails";
import { getMe, logout } from "@/services/api";
import type { User } from "@/types/user";
import type { Email } from "@/types/email";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setAuthLoading(false));
  }, [router]);

  const scheduled = useScheduledEmails();
  const sent = useSentEmails();
  const search = useSearchEmails();

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (q.trim()) {
        search.search(q);
      } else {
        search.clear();
      }
    },
    [search]
  );

  const handleRefresh = useCallback(() => {
    scheduled.refresh();
    sent.refresh();
    if (searchQuery.trim()) search.search(searchQuery);
  }, [scheduled, sent, search, searchQuery]);

  const handleScheduled = useCallback(() => {
    scheduled.refresh();
    sent.refresh();
  }, [scheduled, sent]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [router]);

  const handleEmailClick = useCallback((email: Email) => {
    setSelectedEmail(email);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setSelectedEmail(null);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (showCompose) {
    return (
      <>
        <ComposePage onBack={() => setShowCompose(false)} onScheduled={handleScheduled} />
        <Toast />
      </>
    );
  }

  if (selectedEmail) {
    return (
      <>
        <EmailDetail emailId={selectedEmail.id} onBack={handleBackFromDetail} />
        <Toast />
      </>
    );
  }

  const isSearching = searchQuery.trim().length > 0;
  const displayEmails = isSearching ? search.emails : activeTab === "scheduled" ? scheduled.emails : sent.emails;
  const displayLoading = isSearching ? search.loading : activeTab === "scheduled" ? scheduled.loading : sent.loading;
  const displayError = isSearching ? search.error : activeTab === "scheduled" ? scheduled.error : sent.error;
  const displayType = isSearching ? "sent" : activeTab;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery("");
          search.clear();
        }}
        onCompose={() => setShowCompose(true)}
        onLogout={handleLogout}
        scheduledCount={scheduled.emails.length}
        sentCount={sent.emails.length}
        userName={user.name}
        userEmail={user.email}
        userAvatar={user.avatar}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onRefresh={handleRefresh}
        />

        <main className="flex-1">
          {isSearching && (
            <div className="px-6 py-3 border-b border-gray-50">
              <p className="text-sm text-gray-500">
                Search results for &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
          <EmailTable
            emails={displayEmails}
            loading={displayLoading}
            error={displayError}
            type={displayType}
            onEmailClick={handleEmailClick}
          />
        </main>
      </div>

      <Toast />
    </div>
  );
}
