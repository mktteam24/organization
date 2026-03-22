"use client";

import { useEffect, useRef, useState } from "react";

interface ActivityEntry {
  agentId: string;
  agentName: string;
  agentRole: string;
  type: string;
  message: string;
  date: string;
}

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  init:        { bg: "bg-zinc-100",    text: "text-zinc-500",   label: "INIT" },
  action:      { bg: "bg-blue-100",    text: "text-blue-600",   label: "ACTION" },
  decision:    { bg: "bg-purple-100",  text: "text-purple-600", label: "DECISION" },
  instruction: { bg: "bg-orange-100",  text: "text-orange-600", label: "TASK" },
  response:    { bg: "bg-emerald-100", text: "text-emerald-600",label: "RESPONSE" },
  escalation:  { bg: "bg-red-100",     text: "text-red-600",    label: "ESCALATION" },
};

function getTypeStyle(type: string) {
  return typeStyles[type.toLowerCase()] ?? { bg: "bg-slate-100", text: "text-slate-500", label: type.toUpperCase() };
}

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function ActivityFeed({ open, onToggle }: Props) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [userScrolled, setUserScrolled] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const fetchFeed = () => {
      fetch("/api/activity-feed?limit=80")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setActivities(data.activities ?? []);
        })
        .catch(() => {});
    };

    fetchFeed();
    const timer = setInterval(fetchFeed, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [open]);

  // Auto-scroll to top when new entries arrive, unless user has scrolled down
  useEffect(() => {
    if (activities.length !== prevCountRef.current) {
      prevCountRef.current = activities.length;
      if (!userScrolled && listRef.current) {
        listRef.current.scrollTop = 0;
      }
    }
  }, [activities, userScrolled]);

  const handleScroll = () => {
    if (!listRef.current) return;
    setUserScrolled(listRef.current.scrollTop > 40);
  };

  return (
    <div
      className={`flex flex-col border-l border-slate-200 bg-white transition-all duration-300 shrink-0 ${
        open ? "w-80" : "w-10"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={open ? "Close activity feed" : "Open activity feed"}
        className="flex items-center justify-center h-10 w-10 shrink-0 border-b border-slate-200 hover:bg-slate-50 text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <span className="text-xs font-bold">{open ? "›" : "‹"}</span>
      </button>

      {open && (
        <>
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">Activity Feed</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400">Live</span>
            </span>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            {activities.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-xs text-zinc-400">
                No activity yet
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {activities.map((entry, i) => {
                  const style = getTypeStyle(entry.type);
                  return (
                    <div key={`${entry.agentId}-${i}`} className="px-3 py-2.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-700 truncate flex-1">
                          {entry.agentName}
                        </span>
                        <span className="text-[9px] text-zinc-400 shrink-0">{entry.date}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">
                        {entry.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {userScrolled && (
            <button
              onClick={() => {
                if (listRef.current) listRef.current.scrollTop = 0;
                setUserScrolled(false);
              }}
              className="mx-3 mb-2 py-1 text-[10px] text-blue-600 hover:text-blue-800 border border-blue-200 rounded-full text-center transition-colors"
            >
              ↑ Back to latest
            </button>
          )}
        </>
      )}
    </div>
  );
}
