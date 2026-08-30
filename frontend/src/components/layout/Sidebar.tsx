"use client";

import { Clock, Send, Plus } from "lucide-react";

interface SidebarProps {
  activeTab: "scheduled" | "sent";
  onTabChange: (tab: "scheduled" | "sent") => void;
  onCompose: () => void;
  scheduledCount: number;
  sentCount: number;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onCompose,
  scheduledCount,
  sentCount,
  userName,
  userEmail,
  userAvatar,
}: SidebarProps) {
  return (
    <aside className="w-[160px] min-h-screen border-r border-gray-100 flex flex-col px-3 py-5 bg-white">
      {/* Logo */}
      <div className="text-xl font-extrabold tracking-tight mb-6 px-1 text-gray-900">ONB</div>

      {/* User */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-[#10B981]">
              {userName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
        </div>
        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Compose */}
      <button
        onClick={onCompose}
        className="w-full border border-[#10B981] text-[#10B981] rounded-lg py-2 text-sm font-medium hover:bg-[#10B981]/5 transition-colors mb-6 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Plus size={14} />
        Compose
      </button>

      {/* Nav */}
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
        Core
      </div>
      <nav className="flex flex-col gap-0.5">
        <button
          onClick={() => onTabChange("scheduled")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "scheduled"
              ? "bg-[#10B981]/10 text-[#10B981]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Clock size={16} />
          <span>Scheduled</span>
          <span className="ml-auto text-xs text-gray-400">{scheduledCount}</span>
        </button>
        <button
          onClick={() => onTabChange("sent")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "sent"
              ? "bg-[#10B981]/10 text-[#10B981]"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Send size={16} />
          <span>Sent</span>
          <span className="ml-auto text-xs text-gray-400">{sentCount}</span>
        </button>
      </nav>
    </aside>
  );
}
