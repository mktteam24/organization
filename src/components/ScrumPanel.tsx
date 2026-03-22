"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ScrumMeeting } from "@/lib/types";

interface ScrumPanelProps {
  meetings: ScrumMeeting[];
  onClose: () => void;
}

export default function ScrumPanel({ meetings, onClose }: ScrumPanelProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const scheduled = meetings.filter((m) => m.status === "scheduled");
  const past = meetings.filter((m) => m.status === "past");

  return createPortal(
    <>
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", zIndex: 9998 }}
        onClick={onClose}
      />
      <div style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "384px", backgroundColor: "white", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", zIndex: 9999, display: "flex", flexDirection: "column", borderLeft: "1px solid #e2e8f0" }}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Scrum Meetings</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Biweekly · Within-team & cross-team</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-zinc-500 hover:text-zinc-800 text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <Section title="Scheduled" count={scheduled.length}>
            {scheduled.length === 0
              ? <Empty text="No scrums scheduled yet." />
              : scheduled.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </Section>

          <Section title="Past" count={past.length}>
            {past.length === 0
              ? <Empty text="No past scrums recorded." />
              : past.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </Section>
        </div>
      </div>
    </>,
    document.body
  );
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
        <span className="text-xs rounded-full bg-slate-100 text-zinc-500 px-2 py-0.5">{count}</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-zinc-400 italic">{text}</p>;
}

function MeetingCard({ meeting }: { meeting: ScrumMeeting }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-800">{meeting.date}</span>
        <span className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${meeting.type === "cross-team" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
          {meeting.type === "cross-team" ? "Cross-Team" : "Within-Team"}
        </span>
      </div>
      <div className="text-xs text-zinc-500">
        <span className="font-medium text-zinc-600">Department: </span>{meeting.department}
      </div>
      <div className="text-xs text-zinc-500">
        <span className="font-medium text-zinc-600">Participants: </span>
        {meeting.participants.length === 0 ? "None assigned" : meeting.participants.map((p) => p.agentName).join(", ")}
      </div>
      {meeting.summary && <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{meeting.summary}</p>}
    </div>
  );
}
