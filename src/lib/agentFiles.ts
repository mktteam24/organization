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
    // Support format: **Date:** ... \n **Sender:** ... \n **Receiver:** ...
    const dateMatch = block.match(/\*\*Date:\*\*\s*(.+)/);
    const senderMatch = block.match(/\*\*Sender:\*\*\s*(.+)/);
    const receiverMatch = block.match(/\*\*Receiver:\*\*\s*(.+)/);
    const escalationMatch = block.match(/\*\*Type:\*\*\s*(.+)/);

    if (!dateMatch || !senderMatch || !receiverMatch) return;

    const date = dateMatch[1].trim();
    const sender = senderMatch[1].trim();
    const receiver = receiverMatch[1].trim();
    const typeNote = escalationMatch ? escalationMatch[1].trim() : "";
    const isEscalation = typeNote.toLowerCase().includes("escalat");
    const escalationReason = isEscalation ? typeNote.replace(/escalation[:\s]*/i, "").trim() : undefined;

    // Parse dialogue lines: "Speaker: text" or "Speaker: "text""
    const lines = block.split("\n").filter((l) => {
      const t = l.trim();
      return t && !t.startsWith("**") && t.includes(":");
    });

    const messages = lines
      .map((line) => {
        const m = line.match(/^([A-Za-z0-9_\- ]+?):\s+"?(.+?)"?\s*$/);
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
