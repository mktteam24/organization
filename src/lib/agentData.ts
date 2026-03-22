import { Agent } from "./types";

export const organizationData: Agent = {
  id: "ceo",
  name: "CEO",
  role: "Chief Executive Officer & Founder",
  level: 1,
  status: "active",
  emotion: "focused",
  department: "Executive",
  capabilities: [
    "Define and delegate tasks",
    "Make executive decisions",
    "Spawn and manage subagents",
    "Set priorities and resolve escalations",
    "Oversee all operations",
  ],
  reportsTo: null,
  subagents: [],
};

export const totalAgentCount = 1;
