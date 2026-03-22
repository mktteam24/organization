"use client";

import { useEffect, useState } from "react";
import { Agent, AgentStatus, AgentEmotion, LogEntry, LogEntryType, ConversationEntry } from "@/lib/types";

const statusOptions: AgentStatus[] = ["active", "in-meeting", "on-leave", "busy", "idle"];
const emotionOptions: AgentEmotion[] = ["happy", "focused", "stressed", "frustrated", "neutral", "excited"];

const statusColors: Record<string, string> = {
  active: "text-emerald-600",
  "in-meeting": "text-blue-600",
  "on-leave": "text-yellow-600",
  busy: "text-orange-500",
  idle: "text-zinc-400",
};

const emotionEmoji: Record<string, string> = {
  happy: "😊", focused: "🎯", stressed: "😤",
  frustrated: "😠", neutral: "😐", excited: "🤩",
};

const logTypeStyles: Record<LogEntryType, string> = {
  init: "bg-slate-100 text-slate-600",
  decision: "bg-blue-100 text-blue-600",
  instruction: "bg-purple-100 text-purple-600",
  response: "bg-emerald-100 text-emerald-600",
  escalation: "bg-red-100 text-red-600",
  action: "bg-orange-100 text-orange-600",
};

type Tab = "overview" | "log" | "conversations";

interface AgentPanelProps {
  agent: Agent;
  ancestorChain: Agent[];
  onClose: () => void;
  onStatusChange: (agentId: string, status: AgentStatus) => void;
  onEmotionChange: (agentId: string, emotion: AgentEmotion) => void;
}

export default function AgentPanel({ agent, ancestorChain, onClose, onStatusChange, onEmotionChange }: AgentPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab("overview");
    setLogs([]);
    setConversations([]);
  }, [agent.id]);

  useEffect(() => {
    if (activeTab === "log" || activeTab === "conversations") {
      setLoading(true);
      fetch(`/api/agent-data/${agent.id}`)
        .then((r) => r.json())
        .then((data) => {
          setLogs(data.logs ?? []);
          setConversations(data.conversations ?? []);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, agent.id]);

  return (
    <div data-testid="agent-panel" className="w-80 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{agent.name}</h2>
            <p className="text-sm text-zinc-500">{agent.role}</p>
          </div>
          <button type="button" data-testid="close-panel" onClick={(e) => { e.stopPropagation(); onClose(); }} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-zinc-500 hover:text-zinc-800 text-lg transition-colors shrink-0">✕</button>
        </div>
        {/* Breadcrumb */}
        <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-zinc-400">
          {ancestorChain.length <= 1 ? (
            <span className="italic">Root — no reports-to chain</span>
          ) : (
            ancestorChain.map((a, i) => (
              <span key={a.id} className="flex items-center gap-1">
                {i > 0 && <span className="text-zinc-300">›</span>}
                <span className={a.id === agent.id ? "font-semibold text-zinc-700" : ""}>{a.name}</span>
              </span>
            ))
          )}
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {(["overview", "log", "conversations"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize
                ${activeTab === tab ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-slate-100"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Status dropdown */}
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-xs text-zinc-400 mb-1">Status</div>
                <select
                  value={agent.status}
                  onChange={(e) => onStatusChange(agent.id, e.target.value as AgentStatus)}
                  className={`text-sm font-medium bg-transparent border-none outline-none cursor-pointer w-full ${statusColors[agent.status]}`}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}</option>
                  ))}
                </select>
              </div>
              {/* Emotion dropdown */}
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-xs text-zinc-400 mb-1">Mood</div>
                <select
                  value={agent.emotion}
                  onChange={(e) => onEmotionChange(agent.id, e.target.value as AgentEmotion)}
                  className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer w-full text-zinc-700"
                >
                  {emotionOptions.map((e) => (
                    <option key={e} value={e}>{emotionEmoji[e]} {e.charAt(0).toUpperCase() + e.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-xs text-zinc-400 mb-1">Level</div>
                <div className="text-sm font-medium text-zinc-700">Level {agent.level}</div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-xs text-zinc-400 mb-1">Department</div>
                <div className="text-sm font-medium text-zinc-700">{agent.department}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400 mb-2">Capabilities</div>
              <ul className="flex flex-col gap-1.5">
                {agent.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                    <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>{cap}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs text-zinc-400 mb-1">Subagents</div>
              <div className="text-sm text-zinc-600">
                {agent.subagents.length === 0
                  ? <span className="text-zinc-400 italic">No subagents yet</span>
                  : <span>{agent.subagents.length} direct report{agent.subagents.length > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "log" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-zinc-400 italic text-center py-8">No log entries yet.</p>
            ) : (
              logs.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${logTypeStyles[entry.type]}`}>
                      {entry.type}
                    </span>
                    <span className="text-[10px] text-zinc-400">{entry.date}</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{entry.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "conversations" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-zinc-400 italic text-center py-8">No conversations yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`rounded-lg border bg-white p-3 ${conv.isEscalation ? "border-l-4 border-l-red-400 border-slate-100" : "border-slate-100"}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-700">
                      {conv.sender} → {conv.receiver}
                    </span>
                    <span className="text-[10px] text-zinc-400">{conv.date}</span>
                  </div>
                  {conv.isEscalation && conv.escalationReason && (
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 bg-red-100 text-red-600">Escalation</span>
                      <span className="text-[10px] text-zinc-500">{conv.escalationReason}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {conv.messages.map((msg, i) => (
                      <div key={i} className="text-xs text-zinc-600">
                        <span className="font-semibold text-zinc-700">{msg.speaker}: </span>
                        <span>"{msg.text}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
