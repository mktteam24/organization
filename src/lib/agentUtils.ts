import { Agent, AgentOverrides } from "./types";

export function applyOverrides(agent: Agent, overrides: AgentOverrides): Agent {
  const override = overrides[agent.id] ?? {};
  return {
    ...agent,
    ...override,
    subagents: agent.subagents.map((sub) => applyOverrides(sub, overrides)),
  };
}

export function getAncestorChain(root: Agent, targetId: string): Agent[] {
  if (root.id === targetId) return [root];
  for (const sub of root.subagents) {
    const path = getAncestorChain(sub, targetId);
    if (path.length > 0) return [root, ...path];
  }
  return [];
}
