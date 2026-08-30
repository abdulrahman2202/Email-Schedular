"use client";

import type { Email } from "@/types/email";
import { Clock, Send, Star } from "lucide-react";

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

interface EmailRowProps {
  email: Email;
  type: "scheduled" | "sent";
  onClick: (email: Email) => void;
}

export default function EmailRow({ email, type, onClick }: EmailRowProps) {
  const preview = email.body.replace(/<[^>]+>/g, "").slice(0, 50);

  return (
    <div
      onClick={() => onClick(email)}
      className="flex items-center gap-4 px-6 py-3.5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer group"
    >
      {/* Recipient */}
      <div className="w-44 flex-shrink-0 min-w-0">
        <span className="text-sm text-gray-500">To: </span>
        <span className="text-sm font-medium text-gray-900 truncate">{email.recipient}</span>
      </div>

      {/* Status badge */}
      {type === "scheduled" ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-600 flex-shrink-0 whitespace-nowrap">
          <Clock size={12} />
          {formatDate(email.scheduledAt)}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#10B981]/10 text-[#10B981] flex-shrink-0">
          <Send size={12} />
          Sent
        </span>
      )}

      {/* Subject + body preview */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-900">{email.subject}</span>
        <span className="text-sm text-gray-400 ml-1.5">
          - {preview}
        </span>
      </div>

      {/* Star */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-gray-300 hover:text-yellow-400 transition-colors flex-shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <Star size={16} />
      </button>
    </div>
  );
}
