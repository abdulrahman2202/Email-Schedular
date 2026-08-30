"use client";

import { Clock, Send, Plus, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SidebarProps {
  activeTab: "scheduled" | "sent";
  onTabChange: (tab: "scheduled" | "sent") => void;
  onCompose: () => void;
  onLogout: () => void;
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
  onLogout,
  scheduledCount,
  sentCount,
  userName,
  userEmail,
  userAvatar,
}: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <aside className="w-[160px] min-h-screen border-r border-gray-100 flex flex-col px-3 py-5 bg-white">
      {/* Logo */}
      <div className="text-xl font-extrabold tracking-tight mb-6 px-1 text-gray-900">ONB</div>

      {/* User dropdown */}
      <div className="relative mb-3" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-[#10B981]">
                {userName.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
          </div>
          <svg className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
            </div>
            <button
              onClick={() => { setDropdownOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
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
