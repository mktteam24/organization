import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const AGENTS_DIR = path.join(process.cwd(), "agents");

interface ActivityEntry {
  agentId: string;
  agentName: string;
  agentRole: string;
  type: string;
  message: string;
  date: string;
  index: number;
}

function parseLogEntries(logContent: string, agentId: string, agentName: string, agentRole: string): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const blocks = logContent.split(/^---$/m).map((b) => b.trim()).filter(Boolean);

  blocks.forEach((block, index) => {
    const match = block.match(/\*\*\[(\d{4}-\d{2}-\d{2})\]\*\*\s*—\s*(\w+)\s*—\s*([\s\S]+)/);
    if (!match) return;
    const [, date, type, message] = match;
    entries.push({
      agentId,
      agentName,
      agentRole,
      type: type.trim(),
      message: message.trim().replace(/\n+/g, " "),
      date,
      index,
    });
  });

  return entries;
}

function collectAllActivities(dir: string, relPath: string): ActivityEntry[] {
  let results: ActivityEntry[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  // Find the agent .md file to get name/role
  const agentName = path.basename(dir).replace(/-/g, " ");
  const agentId = relPath;
  let agentRole = agentName;

  const mdFile = entries.find((e) => e.isFile() && e.name === `${path.basename(dir)}.md`);
  if (mdFile) {
    try {
      const content = fs.readFileSync(path.join(dir, mdFile.name), "utf-8");
      const roleMatch = content.match(/\*\*Role:\*\*\s*(.+)/);
      if (roleMatch) agentRole = roleMatch[1].trim();
    } catch { /* ignore */ }
  }

  // Read log.md
  const logPath = path.join(dir, "log.md");
  if (fs.existsSync(logPath)) {
    try {
      const logContent = fs.readFileSync(logPath, "utf-8");
      results.push(...parseLogEntries(logContent, agentId, agentName, agentRole));
    } catch { /* ignore */ }
  }

  // Recurse into subdirectories
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const childPath = relPath ? `${relPath}/${entry.name}` : entry.name;
      results.push(...collectAllActivities(path.join(dir, entry.name), childPath));
    }
  }

  return results;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "60");

  try {
    const ceoPath = path.join(AGENTS_DIR, "CEO");
    if (!fs.existsSync(ceoPath)) {
      return NextResponse.json({ activities: [] });
    }

    const all = collectAllActivities(ceoPath, "CEO");

    // Sort by date desc, then by index desc within same date
    all.sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.index - a.index;
    });

    return NextResponse.json({ activities: all.slice(0, limit) });
  } catch {
    return NextResponse.json({ activities: [] });
  }
}
