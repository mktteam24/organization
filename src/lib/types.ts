export type AgentStatus = "active" | "in-meeting" | "on-leave" | "busy" | "idle";
export type AgentEmotion = "happy" | "focused" | "stressed" | "frustrated" | "neutral" | "excited";
export type LogEntryType = "init" | "decision" | "instruction" | "response" | "escalation" | "action";

export interface Agent {
  id: string;
  name: string;
  role: string;
  level: number;
  status: AgentStatus;
  emotion: AgentEmotion;
  department: string;
  capabilities: string[];
  subagents: Agent[];
  reportsTo: string | null;
}

export interface LogEntry {
  id: string;
  type: LogEntryType;
  date: string;
  content: string;
}

export interface ConversationMessage {
  speaker: string;
  text: string;
}

export interface ConversationEntry {
  id: string;
  date: string;
  sender: string;
  receiver: string;
  messages: ConversationMessage[];
  isEscalation: boolean;
  escalationReason?: string;
}

export interface ScrumParticipant {
  agentId: string;
  agentName: string;
  department: string;
}

export interface ScrumMeeting {
  id: string;
  date: string;
  type: "within-team" | "cross-team";
  department: string;
  participants: ScrumParticipant[];
  summary?: string;
  status: "scheduled" | "past";
}

export type AgentOverrides = Record<string, { status?: AgentStatus; emotion?: AgentEmotion }>;
