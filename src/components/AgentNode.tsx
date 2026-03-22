"use client";

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
};

interface AgentNodeProps {
  agent: Agent;
  selectedId: string | null;
  onClick: (agent: Agent) => void;
}

export default function AgentNode({ agent, selectedId, onClick }: AgentNodeProps) {
  const isSelected = agent.id === selectedId;
  const nodeStyle = levelStyles[agent.level] ?? "border-zinc-300";

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => onClick(agent)}
        className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 w-44 text-center transition-all duration-200 bg-white shadow-md
          ${nodeStyle}
          ${isSelected ? "ring-2 ring-zinc-400 scale-105 shadow-lg" : "hover:scale-105 hover:shadow-lg"}
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
        <div className="mt-2 text-[9px] text-zinc-300">click to explore</div>
      </div>

      {agent.subagents.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-slate-300" />
          <div className="flex gap-8">
            {agent.subagents.map((sub) => (
              <div key={sub.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-slate-300" />
                <AgentNode agent={sub} selectedId={selectedId} onClick={onClick} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
