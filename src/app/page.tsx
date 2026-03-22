"use client";

import { useState, useEffect, useRef } from "react";
import { scrumMeetings } from "@/lib/scrumData";
import { Agent, AgentStatus, AgentEmotion, AgentOverrides } from "@/lib/types";
import { applyOverrides, getAncestorChain } from "@/lib/agentUtils";
import AgentNode from "@/components/AgentNode";
import AgentPanel from "@/components/AgentPanel";
import ScrumPanel from "@/components/ScrumPanel";
import ActivityFeed from "@/components/ActivityFeed";

const AGENT_MIN = 1000;
const AGENT_MAX = 1050;
const POLL_INTERVAL = 3000;

export default function Home() {
  const [orgData, setOrgData] = useState<Agent | null>(null);
  const [totalAgentCount, setTotalAgentCount] = useState(0);
  const [agentOverrides, setAgentOverrides] = useState<AgentOverrides>({});
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("CEO");
  const [panelOpen, setPanelOpen] = useState(true);
  const [scrumOpen, setScrumOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [feedOpen, setFeedOpen] = useState(true);
  const overridesRef = useRef(agentOverrides);
  overridesRef.current = agentOverrides;

  useEffect(() => {
    let cancelled = false;

    const fetchOrg = () => {
      fetch("/api/org-tree")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled && data.root) {
            setOrgData(data.root);
            setTotalAgentCount(data.totalAgentCount ?? 0);
            setLastUpdated(new Date());
          }
        })
        .catch(() => {});
    };

    fetchOrg();
    const timer = setInterval(fetchOrg, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const displayData = orgData ? applyOverrides(orgData, agentOverrides) : null;
  const selectedAgent = selectedAgentId && displayData ? findAgent(displayData, selectedAgentId) : null;
  const ancestorChain = selectedAgent && displayData ? getAncestorChain(displayData, selectedAgent.id) : [];

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setPanelOpen(true);
  };

  const handleStatusChange = (agentId: string, status: AgentStatus) => {
    setAgentOverrides((prev) => ({ ...prev, [agentId]: { ...prev[agentId], status } }));
  };

  const handleEmotionChange = (agentId: string, emotion: AgentEmotion) => {
    setAgentOverrides((prev) => ({ ...prev, [agentId]: { ...prev[agentId], emotion } }));
  };

  const fillPercent = Math.min(100, Math.max(0, ((totalAgentCount - AGENT_MIN) / (AGENT_MAX - AGENT_MIN)) * 100));
  const isInRange = totalAgentCount >= AGENT_MIN && totalAgentCount <= AGENT_MAX;
  const isBelowRange = totalAgentCount < AGENT_MIN;

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Organization</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Digital Agent Hierarchy</p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">Agent Count</span>
              <span className={`text-xs font-semibold ml-4 ${isInRange ? "text-emerald-600" : isBelowRange ? "text-amber-500" : "text-red-500"}`}>
                {totalAgentCount} / {AGENT_MIN}–{AGENT_MAX}
              </span>
            </div>
            <div className="w-40 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isInRange ? "bg-emerald-500" : isBelowRange ? "bg-amber-400" : "bg-red-500"}`}
                style={{ width: `${Math.max(2, fillPercent)}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-400">Max Depth</div>
            <div className="text-base font-bold text-blue-600">10 levels</div>
          </div>

          <button
            type="button"
            onClick={() => setScrumOpen(true)}
            className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
          >
            📅 Scrums
            {scrumMeetings.filter((m) => m.status === "scheduled").length > 0 && (
              <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                {scrumMeetings.filter((m) => m.status === "scheduled").length}
              </span>
            )}
          </button>

          {lastUpdated && (
            <div className="text-right">
              <div className="text-xs text-zinc-400">Last updated</div>
              <div className="text-xs font-medium text-zinc-500">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">Live</span>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="flex items-center gap-6 px-8 py-3 border-b border-slate-200 bg-white text-xs text-zinc-500 flex-wrap">
        <span className="font-medium text-zinc-600">Levels:</span>
        {[
          { color: "border-yellow-400 bg-yellow-100", label: "L1" },
          { color: "border-blue-400 bg-blue-100", label: "L2" },
          { color: "border-purple-400 bg-purple-100", label: "L3" },
          { color: "border-pink-400 bg-pink-100", label: "L4" },
          { color: "border-emerald-400 bg-emerald-100", label: "L5" },
          { color: "border-teal-400 bg-teal-100", label: "L6" },
          { color: "border-indigo-400 bg-indigo-100", label: "L7" },
          { color: "border-rose-400 bg-rose-100", label: "L8" },
          { color: "border-amber-400 bg-amber-100", label: "L9" },
          { color: "border-cyan-400 bg-cyan-100", label: "L10" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded border-2 ${color}`} />
            <span>{label}</span>
          </div>
        ))}
        <span className="ml-4 font-medium text-zinc-600">Status:</span>
        {[
          { color: "bg-emerald-500", label: "Active" },
          { color: "bg-blue-500", label: "In Meeting" },
          { color: "bg-yellow-400", label: "On Leave" },
          { color: "bg-orange-400", label: "Busy" },
          { color: "bg-zinc-300", label: "Idle" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="px-8 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
        <input
          type="text"
          placeholder="Search agents by name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-72 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-blue-400 focus:bg-white transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-start pt-8 p-8 overflow-auto">
          {displayData ? (
            <AgentNode
              agent={displayData}
              selectedId={panelOpen ? selectedAgentId : null}
              onClick={handleSelectAgent}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 mt-20 text-zinc-400">
              <div className="h-8 w-8 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
              <span className="text-sm">Loading organization...</span>
            </div>
          )}
        </div>

        {selectedAgent && panelOpen && (
          <div className="shrink-0 p-4 pl-0">
            <AgentPanel
              agent={selectedAgent}
              ancestorChain={ancestorChain}
              onClose={() => setPanelOpen(false)}
              onStatusChange={handleStatusChange}
              onEmotionChange={handleEmotionChange}
            />
          </div>
        )}

        <ActivityFeed open={feedOpen} onToggle={() => setFeedOpen((v) => !v)} />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-8 py-3 flex items-center justify-between text-xs text-zinc-400">
        <span>Each agent is a digital human — with knowledge, intelligence, emotions, and personality.</span>
        <span>Biweekly scrums · Max 10 subagents per agent · Max 10 levels deep</span>
      </footer>

      {scrumOpen && <ScrumPanel meetings={scrumMeetings} onClose={() => setScrumOpen(false)} />}
    </div>
  );
}

function findAgent(root: Agent, id: string): Agent | null {
  if (root.id === id) return root;
  for (const sub of root.subagents) {
    const found = findAgent(sub, id);
    if (found) return found;
  }
  return null;
}
