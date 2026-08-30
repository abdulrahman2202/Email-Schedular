"use client";

import type { Email } from "@/types/email";
import { Clock, Send, Star } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const date = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${month} ${date} ${h12}:${m} ${ampm}`;
}

interface EmailRowProps {
  email: Email;
  type: "scheduled" | "sent";
  onClick: (email: Email) => void;
}

export default function EmailRow({ email, type, onClick }: EmailRowProps) {
  const preview = email.body.replace(/<[^>]+>/g, "").slice(0, 60);

  return (
    <div
      onClick={() => onClick(email)}
      className="flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer group"
    >
      {/* Recipient */}
      <span className="text-sm text-gray-500 flex-shrink-0 whitespace-nowrap">
        To: <span className="text-gray-800">{email.recipient}</span>
      </span>

      {/* Status badge */}
      {type === "scheduled" ? (
        <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 flex-shrink-0 whitespace-nowrap">
          <Clock size={11} />
          {formatDate(email.scheduledAt)}
        </span>
      ) : (
        <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#10B981]/10 text-[#10B981] flex-shrink-0 whitespace-nowrap">
          <Send size={11} />
          Sent
        </span>
      )}

      {/* Subject + preview */}
      <span className="ml-3 flex-1 min-w-0 truncate">
        <span className="text-sm font-semibold text-gray-900">{email.subject}</span>
        <span className="text-sm text-gray-400"> - {preview}</span>
      </span>

      {/* Star */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="ml-2 text-gray-300 hover:text-yellow-400 transition-colors flex-shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <Star size={16} />
      </button>
    </div>
  );
}
