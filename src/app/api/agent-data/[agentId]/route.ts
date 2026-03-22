import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { parseLogMd, parseConversationsMd } from "@/lib/agentFiles";

const AGENTS_DIR = path.join("E:", "snehasish", "agents");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const agentDir = path.join(AGENTS_DIR, agentId);

  const readFile = async (filename: string): Promise<string> => {
    try {
      return await fs.readFile(path.join(agentDir, filename), "utf-8");
    } catch {
      return "";
    }
  };

  const [logRaw, convsRaw] = await Promise.all([
    readFile("log.md"),
    readFile("conversations.md"),
  ]);

  return NextResponse.json({
    logs: parseLogMd(logRaw),
    conversations: parseConversationsMd(convsRaw),
  });
}
