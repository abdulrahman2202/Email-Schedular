"use client";

import { ArrowLeft, Star, Trash2, Archive } from "lucide-react";
import { useState, useEffect } from "react";
import { getEmailById } from "@/services/api";
import type { Email } from "@/types/email";

function formatFullDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${month} ${day}, ${h12}:${m} ${ampm}`;
}

interface EmailDetailProps {
  emailId: string;
  onBack: () => void;
}

export default function EmailDetail({ emailId, onBack }: EmailDetailProps) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getEmailById(emailId)
      .then((res) => setEmail(res.email))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load email"))
      .finally(() => setLoading(false));
  }, [emailId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#10B981] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error || "Email not found"}</p>
        <button onClick={onBack} className="text-sm text-[#10B981] hover:underline cursor-pointer">
          Go back
        </button>
      </div>
    );
  }

  const senderEmail = email.sender?.email || "unknown@sender.com";
  const senderName = senderEmail.split("@")[0];
  const initial = senderName.charAt(0).toUpperCase();
  const displayDate = email.sentAt || email.scheduledAt || email.createdAt;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate max-w-xl">
            {email.subject}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Star size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Archive size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Sender info */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-gray-900">{senderName}</span>
              <span className="text-xs text-gray-400">&lt;{senderEmail}&gt;</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-400">to me</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{formatFullDate(displayDate)}</span>
        </div>

        {/* Body */}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {email.body}
        </div>

        {/* Status info */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Status: <span className="font-medium text-gray-600">{email.status}</span></span>
            {email.sentAt && <span>Sent: {formatFullDate(email.sentAt)}</span>}
            {email.messageId && <span>Message ID: {email.messageId}</span>}
          </div>
          {email.error && (
            <p className="text-xs text-red-500 mt-2">Error: {email.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
