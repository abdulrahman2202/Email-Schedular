"use client";

import type { Email } from "@/types/email";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { Clock, Send } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = days[d.getDay()];
  const month = months[d.getMonth()];
  const date = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${day} ${month} ${date} ${h12}:${m} ${ampm}`;
}

interface EmailTableProps {
  emails: Email[];
  loading: boolean;
  error: string | null;
  type: "scheduled" | "sent";
}

export default function EmailTable({ emails, loading, error, type }: EmailTableProps) {
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
        <div
          key={email.id}
          className="flex items-center gap-4 px-6 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
        >
          {/* Recipient */}
          <div className="w-40 flex-shrink-0">
            <span className="text-sm text-gray-500">To: </span>
            <span className="text-sm font-medium text-gray-900">{email.recipient}</span>
          </div>

          {/* Status badge */}
          {type === "scheduled" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-orange-50 text-orange-700 flex-shrink-0">
              <Clock size={10} />
              {formatDate(email.scheduledAt)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#10B981]/10 text-[#10B981] flex-shrink-0">
              <Send size={10} />
              Sent
            </span>
          )}

          {/* Subject + body preview */}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-gray-900">{email.subject}</span>
            <span className="text-sm text-gray-400 ml-1.5">
              - {email.body.replace(/<[^>]+>/g, "").slice(0, 60)}
            </span>
          </div>

          {/* Star */}
          <button className="text-gray-300 hover:text-yellow-400 transition-colors flex-shrink-0 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
