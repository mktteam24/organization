"use client";

import { useState } from "react";
import { Agent } from "@/lib/types";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500",
  "in-meeting": "bg-blue-500",
  "on-leave": "bg-yellow-400",
  busy: "bg-orange-400",
  idle: "bg-zinc-300",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  "in-meeting": "In Meeting",
  "on-leave": "On Leave",
  busy: "Busy",
  idle: "Idle",
};

const emotionEmoji: Record<string, string> = {
  happy: "😊",
  focused: "🎯",
  stressed: "😤",
  frustrated: "😠",
  neutral: "😐",
  excited: "🤩",
};

const levelStyles: Record<number, string> = {
  1: "border-yellow-400 shadow-yellow-100",
  2: "border-blue-400 shadow-blue-100",
  3: "border-purple-400 shadow-purple-100",
  4: "border-pink-400 shadow-pink-100",
  5: "border-emerald-400 shadow-emerald-100",
  6: "border-teal-400 shadow-teal-100",
  7: "border-indigo-400 shadow-indigo-100",
  8: "border-rose-400 shadow-rose-100",
  9: "border-amber-400 shadow-amber-100",
  10: "border-cyan-400 shadow-cyan-100",
};

function hasMatchingDescendant(agent: Agent, query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase();
  if (agent.name.toLowerCase().includes(q) || agent.role.toLowerCase().includes(q)) return true;
  return agent.subagents.some((sub) => hasMatchingDescendant(sub, query));
}

interface AgentNodeProps {
  agent: Agent;
  selectedId: string | null;
  onClick: (agent: Agent) => void;
  searchQuery?: string;
}

export default function AgentNode({ agent, selectedId, onClick, searchQuery = "" }: AgentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(agent.level === 1);

  const isSelected = agent.id === selectedId;
  const nodeStyle = levelStyles[agent.level] ?? "border-zinc-300";
  const hasChildren = agent.subagents.length > 0;
  const q = searchQuery.toLowerCase();
  const isMatch = q !== "" && (agent.name.toLowerCase().includes(q) || agent.role.toLowerCase().includes(q));
  const shouldForceExpand = q !== "" && agent.subagents.some((sub) => hasMatchingDescendant(sub, q));
  const showChildren = hasChildren && (isExpanded || shouldForceExpand);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          onClick={() => onClick(agent)}
          className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 w-44 text-center transition-all duration-200 bg-white shadow-md
            ${nodeStyle}
            ${isSelected ? "ring-2 ring-zinc-400 scale-105 shadow-lg" : "hover:scale-105 hover:shadow-lg"}
            ${isMatch ? "ring-2 ring-yellow-400 bg-yellow-50" : ""}
          `}
        >
          <div className="absolute -top-2 -right-2 text-lg">{emotionEmoji[agent.emotion]}</div>
          <div className={`mx-auto mb-2 h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
          <div className="text-sm font-bold text-zinc-900 truncate">{agent.name}</div>
          <div className="text-xs text-zinc-500 mt-0.5 truncate">{agent.role}</div>
          <div className="mt-1.5 text-xs text-zinc-400">{agent.department}</div>
          <div className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-zinc-500">
            {statusLabels[agent.status]}
          </div>
        </div>

        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v); }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-white border border-slate-300 shadow text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-all text-[10px]"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <span className={`transition-transform duration-200 ${showChildren ? "rotate-90" : ""}`}>▶</span>
          </button>
        )}
      </div>

      {showChildren && (
        <div className="flex flex-col items-center mt-3">
          <div className="w-px h-4 bg-slate-300" />
          <div className="flex gap-6 flex-wrap justify-center">
            {agent.subagents.map((sub) => (
              <div key={sub.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-slate-300" />
                <AgentNode
                  agent={sub}
                  selectedId={selectedId}
                  onClick={onClick}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
