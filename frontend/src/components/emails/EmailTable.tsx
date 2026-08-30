"use client";

import type { Email } from "@/types/email";
import EmailRow from "./EmailRow";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { Clock, Send } from "lucide-react";

interface EmailTableProps {
  emails: Email[];
  loading: boolean;
  error: string | null;
  type: "scheduled" | "sent";
  onEmailClick: (email: Email) => void;
}

export default function EmailTable({ emails, loading, error, type, onEmailClick }: EmailTableProps) {
  if (loading) return <LoadingState />;
  if (error)
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  if (emails.length === 0)
    return (
      <EmptyState
        icon={type === "scheduled" ? <Clock size={24} /> : <Send size={24} />}
        title={type === "scheduled" ? "No scheduled emails" : "No sent emails"}
        description={
          type === "scheduled"
            ? "Emails you schedule will appear here."
            : "Emails that have been sent will appear here."
        }
      />
    );

  return (
    <div className="flex flex-col">
      {emails.map((email) => (
        <EmailRow key={email.id} email={email} type={type} onClick={onEmailClick} />
      ))}
    </div>
  );
}
