"use client";

import { useState, useEffect } from "react";
import { Plug, Unplug } from "lucide-react";
import { getSlackStatus, disconnectSlack, getSlackConnectUrl } from "@/services/api";
import { showToast } from "@/components/ui/Toast";

export default function SlackConnection() {
  const [connected, setConnected] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSlackStatus()
      .then((res) => {
        setConnected(res.connected);
        setTeamId(res.teamId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnectSlack();
      setConnected(false);
      setTeamId(null);
      showToast("success", "Slack disconnected");
    } catch {
      showToast("error", "Failed to disconnect Slack");
    }
  };

  if (loading) return null;

  return (
    <div className="px-3 py-2">
      {connected ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-xs text-gray-600 flex-1">Slack connected</span>
          <button
            onClick={handleDisconnect}
            className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
          >
            <Unplug size={14} />
          </button>
        </div>
      ) : (
        <a
          href={getSlackConnectUrl()}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#10B981] transition-colors"
        >
          <Plug size={14} />
          Connect Slack
        </a>
      )}
      {teamId && (
        <p className="text-[10px] text-gray-400 mt-1">Team: {teamId}</p>
      )}
    </div>
  );
}
