"use client";

import { Search, Filter, RefreshCw, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onLogout?: () => void;
}

export default function Header({ searchQuery, onSearchChange, onRefresh, onLogout }: HeaderProps) {
  const [local, setLocal] = useState(searchQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(searchQuery);
  }, [searchQuery]);

  const handleChange = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearchChange(v), 400);
  };

  return (
    <header className="h-14 border-b border-gray-100 flex items-center px-6 bg-white">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#f0f0f0] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
          />
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
          <Filter size={16} />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={16} />
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
