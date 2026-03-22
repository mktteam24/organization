import { LogEntry, LogEntryType, ConversationEntry } from "./types";

function inferLogType(text: string): LogEntryType {
  const t = text.toLowerCase();
  if (t.includes("initializ") || t.includes("spawned") || t.includes("created")) return "init";
  if (t.includes("escalat")) return "escalation";
  if (t.includes("decision") || t.includes("decided")) return "decision";
  if (t.includes("instruction") || t.includes("delegat") || t.includes("assigned")) return "instruction";
  if (t.includes("response") || t.includes("received") || t.includes("replied")) return "response";
  return "action";
}

export function parseLogMd(raw: string): LogEntry[] {
  const blocks = raw.split(/^---$/m).map((b) => b.trim()).filter(Boolean);
  const entries: LogEntry[] = [];

  blocks.forEach((block, i) => {
    const dateMatch = block.match(/\*\*\[(\d{4}-\d{2}-\d{2})[^\]]*\]\*\*/);
    if (!dateMatch) return;
    const date = dateMatch[1];
    const content = block.replace(/\*\*\[[^\]]*\]\*\*\s*—?\s*/, "").trim();
    if (!content) return;
    entries.push({
      id: `log-${i}`,
      type: inferLogType(content),
      date,
      content,
    });
  });

  return entries;
}

export function parseConversationsMd(raw: string): ConversationEntry[] {
  const blocks = raw.split(/^---$/m).map((b) => b.trim()).filter(Boolean);
  const entries: ConversationEntry[] = [];

  blocks.forEach((block, i) => {
    const headerMatch = block.match(/\*\*\[([^\|]+)\|([^→]+)→([^\]]+)\]\*\*(.*)?/);
    if (!headerMatch) return;

    const date = headerMatch[1].trim();
    const sender = headerMatch[2].trim();
    const receiver = headerMatch[3].trim();
    const escalationNote = headerMatch[4] ?? "";
    const isEscalation = escalationNote.toLowerCase().includes("escalat");
    const escalationReason = isEscalation
      ? escalationNote.replace(/\*|\(|\)/g, "").replace(/escalated\s*—?\s*/i, "").trim()
      : undefined;

    const lines = block.split("\n").slice(1).filter((l) => l.trim());
    const messages = lines
      .map((line) => {
        const m = line.match(/^([^:]+):\s+"?(.+?)"?\s*$/);
        if (!m) return null;
        return { speaker: m[1].trim(), text: m[2].trim() };
      })
      .filter(Boolean) as { speaker: string; text: string }[];

    if (messages.length === 0) return;

    entries.push({
      id: `conv-${i}`,
      date,
      sender,
      receiver,
      messages,
      isEscalation,
      escalationReason,
    });
  });

  return entries;
}
