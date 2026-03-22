import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Agent, AgentStatus, AgentEmotion } from "@/lib/types";

const AGENTS_DIR = path.join(process.cwd(), "agents");

function parseAgentMd(content: string) {
  const get = (section: string) => {
    const match = content.match(new RegExp(`## ${section}\\s*\\n([^#]+)`));
    return match ? match[1].trim() : "";
  };

  const role = get("Role") || "Unknown Role";
  const department = get("Department") || "Unknown";
  const statusRaw = get("Status").toLowerCase().trim();
  const levelStr = get("Level").trim();
  const level = parseInt(levelStr) || 1;

  const validStatuses: AgentStatus[] = ["active", "in-meeting", "on-leave", "busy", "idle"];
  const status: AgentStatus = validStatuses.includes(statusRaw as AgentStatus)
    ? (statusRaw as AgentStatus)
    : "active";

  const capsSection = get("Capabilities");
  const capabilities = capsSection
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);

  const emotionOptions: AgentEmotion[] = ["happy", "focused", "stressed", "frustrated", "neutral", "excited"];
  const emotionRaw = get("Emotion").toLowerCase().trim();
  const emotion: AgentEmotion = emotionOptions.includes(emotionRaw as AgentEmotion)
    ? (emotionRaw as AgentEmotion)
    : "focused";

  return { role, department, status, level, capabilities, emotion };
}

function buildAgentTree(
  dirPath: string,
  agentName: string,
  relPath: string,
  level: number,
  reportsTo: string | null
): Agent {
  // Security: ensure we never traverse outside agents directory
  const resolvedDir = path.resolve(dirPath);
  if (!resolvedDir.startsWith(path.resolve(AGENTS_DIR))) {
    return { id: relPath, name: agentName, role: agentName, level, status: "active", emotion: "neutral", department: "Unknown", capabilities: [], subagents: [], reportsTo };
  }
  const mdPath = path.join(dirPath, `${agentName}.md`);

  let role = agentName.replace(/-/g, " ");
  let department = "Unknown";
  let status: AgentStatus = "active";
  let emotion: AgentEmotion = "focused";
  let agentLevel = level;
  let capabilities: string[] = [];

  if (fs.existsSync(mdPath)) {
    const content = fs.readFileSync(mdPath, "utf-8");
    const parsed = parseAgentMd(content);
    role = parsed.role || role;
    department = parsed.department || department;
    status = parsed.status;
    emotion = parsed.emotion;
    agentLevel = parsed.level || level;
    capabilities = parsed.capabilities;
  }

  let subagents: Agent[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    subagents = entries
      .filter((e) => e.isDirectory())
      .map((dir) => {
        const childRelPath = `${relPath}/${dir.name}`;
        return buildAgentTree(
          path.join(dirPath, dir.name),
          dir.name,
          childRelPath,
          agentLevel + 1,
          agentName
        );
      });
  } catch {
    // directory unreadable
  }

  return {
    id: relPath,
    name: agentName.replace(/-/g, " "),
    role,
    level: agentLevel,
    status,
    emotion,
    department,
    capabilities,
    subagents,
    reportsTo,
  };
}

function countAgents(agent: Agent): number {
  return 1 + agent.subagents.reduce((sum, sub) => sum + countAgents(sub), 0);
}

export async function GET() {
  try {
    const ceoPath = path.join(AGENTS_DIR, "CEO");
    if (!fs.existsSync(ceoPath)) {
      return NextResponse.json({ error: "No CEO agent found" }, { status: 404 });
    }
    const root = buildAgentTree(ceoPath, "CEO", "CEO", 1, null);
    const totalAgentCount = countAgents(root);
    return NextResponse.json({ root, totalAgentCount });
  } catch {
    return NextResponse.json({ error: "Failed to read org tree" }, { status: 500 });
  }
}
