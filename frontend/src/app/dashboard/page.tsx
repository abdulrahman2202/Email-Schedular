"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import EmailTable from "@/components/emails/EmailTable";
import ComposePage from "@/components/emails/ComposePage";
import SlackConnection from "@/components/slack/SlackConnection";
import Toast from "@/components/ui/Toast";
import { useScheduledEmails, useSentEmails, useSearchEmails } from "@/hooks/useEmails";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  if (showCompose) {
    return <ComposePage onBack={() => setShowCompose(false)} onScheduled={handleScheduled} />;
  }

  const isSearching = searchQuery.trim().length > 0;
  const displayEmails = isSearching ? search.emails : activeTab === "scheduled" ? scheduled.emails : sent.emails;
  const displayLoading = isSearching ? search.loading : activeTab === "scheduled" ? scheduled.loading : sent.loading;
  const displayError = isSearching ? search.error : activeTab === "scheduled" ? scheduled.error : sent.error;

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
        scheduledCount={scheduled.emails.length}
        sentCount={sent.emails.length}
        userName="Oliver Brown"
        userEmail="oliver.brown@domain.io"
        userAvatar={null}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onRefresh={handleRefresh}
        />

        <main className="flex-1">
          {isSearching ? (
            <div>
              <div className="px-6 py-3 border-b border-gray-50">
                <p className="text-sm text-gray-500">
                  Search results for &quot;{searchQuery}&quot;
                </p>
              </div>
              <EmailTable emails={displayEmails} loading={displayLoading} error={displayError} type="sent" />
            </div>
          ) : (
            <EmailTable
              emails={displayEmails}
              loading={displayLoading}
              error={displayError}
              type={activeTab}
            />
          )}
        </main>
      </div>

      <Toast />
    </div>
  );
}
