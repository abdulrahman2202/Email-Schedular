"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Paperclip, Clock, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FileUpload from "./FileUpload";
import { getSenders, scheduleEmails } from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import type { Sender } from "@/types/sender";

interface ComposePageProps {
  onBack: () => void;
  onScheduled: () => void;
}

export default function ComposePage({ onBack, onScheduled }: ComposePageProps) {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState("");
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [toInput, setToInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delay, setDelay] = useState("02");
  const [hourlyLimit, setHourlyLimit] = useState("50");
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toISOString().slice(0, 16);
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSendLater, setShowSendLater] = useState(false);

  useEffect(() => {
    getSenders()
      .then((res) => {
        setSenders(res.senders);
        if (res.senders.length > 0) setSenderId(res.senders[0]!.id);
      })
      .catch(() => {});
  }, []);

  const addRecipient = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (trimmed && emailRegex.test(trimmed) && !toEmails.includes(trimmed)) {
      setToEmails((prev) => [...prev, trimmed]);
    }
  };

  const removeRecipient = (email: string) => {
    setToEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleToKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(toInput);
      setToInput("");
    }
    if (e.key === "Backspace" && !toInput && toEmails.length > 0) {
      setToEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleCsvEmails = (emails: string[]) => {
    setToEmails((prev) => {
      const merged = new Set([...prev, ...emails]);
      return Array.from(merged);
    });
  };

  const handleSubmit = async () => {
    if (!senderId) {
      showToast("error", "Please select a sender");
      return;
    }
    if (toEmails.length === 0) {
      showToast("error", "Please add at least one recipient");
      return;
    }
    if (!subject.trim()) {
      showToast("error", "Please enter a subject");
      return;
    }

    setSubmitting(true);
    try {
      const delayMs = Math.max(parseInt(delay || "0", 10) * 1000, 2000);
      await scheduleEmails({
        senderId,
        subject: subject.trim(),
        body: body.trim() || subject.trim(),
        recipients: toEmails,
        startTime: new Date(startTime).toISOString(),
        delayBetweenEmails: delayMs,
      });
      showToast("success", `Emails scheduled successfully to ${toEmails.length} recipients`);
      onScheduled();
      onBack();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to schedule emails");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSender = senders.find((s) => s.id === senderId);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Compose New Email</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
            <Paperclip size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setShowSendLater(!showSendLater)}>
            <Clock size={18} />
          </button>
          {showSendLater && (
            <div className="absolute right-24 top-14 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 z-50">
              <p className="text-sm font-semibold text-gray-900 mb-3">Send Later</p>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm mb-3"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSendLater(false)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                  Cancel
                </button>
                <Button size="sm" onClick={() => setShowSendLater(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Sending..." : "Send Later"}
          </Button>
        </div>
      </div>

      {/* Compose body */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* From */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-500 w-12">From</span>
          <select
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 cursor-pointer"
          >
            {senders.map((s) => (
              <option key={s.id} value={s.id}>
                {s.email}
              </option>
            ))}
          </select>
        </div>

        {/* To */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-sm text-gray-500 w-12 mt-2">To</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              {toEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium"
                >
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className="hover:text-[#059669] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {toEmails.length === 0 && (
                <input
                  type="text"
                  placeholder="recipient@example.com"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={handleToKeyDown}
                  onBlur={() => {
                    if (toInput.trim()) {
                      addRecipient(toInput);
                      setToInput("");
                    }
                  }}
                  className="flex-1 min-w-[200px] bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
                />
              )}
              {toEmails.length > 0 && (
                <input
                  type="text"
                  placeholder=""
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={handleToKeyDown}
                  className="flex-1 min-w-[100px] bg-transparent text-sm focus:outline-none"
                />
              )}
            </div>
          </div>
          <FileUpload onEmailsParsed={handleCsvEmails} />
        </div>

        {/* Recipient count */}
        {toEmails.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12" />
            <p className="text-sm text-[#10B981] font-medium">
              ✓ {toEmails.length} email address{toEmails.length !== 1 ? "s" : ""} detected
            </p>
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-500 w-12">Subject</span>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Delay + Hourly Limit */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Delay between 2 emails</span>
            <input
              type="text"
              value={delay}
              onChange={(e) => setDelay(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="w-12 px-2 py-1 rounded bg-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hourly Limit</span>
            <input
              type="text"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="w-12 px-2 py-1 rounded bg-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
            />
          </div>
        </div>

        {/* Body */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
            {["↩", "↪", "T", "B", "I", "U", "≡", "⋮", "•", "≡", "≡", "≡", "❝", "🔗", "DECREF"].map(
              (icon, i) => (
                <button
                  key={i}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-200 rounded text-xs cursor-pointer"
                >
                  {icon}
                </button>
              )
            )}
          </div>
          <textarea
            placeholder="Type Your Reply..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-80 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
