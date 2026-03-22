# Claude Rules for This Project

## Deletion Policy — STRICT

**Never delete any file, folder, or content outside of `E:\snehasish\` without explicit permission from the user.**

Even if the user grants permission to delete something:
- **Always ask again to reconfirm** before proceeding with any deletion.
- This applies to files, folders, branches, database entries, or any other destructive/irreversible removal.

### Examples of required reconfirmation:
- User says "delete that file" → Ask: "Just to confirm, you want me to permanently delete [file path]?"
- User says "yes go ahead and delete it" → Ask once more: "This will permanently remove [file path]. Are you sure?"
- User says "clean up the old folders" → Identify what would be deleted, list them, and ask for explicit reconfirmation before proceeding.

### What counts as "deletion":
- `rm`, `rmdir`, `del`, `rd`, or equivalent commands
- `git branch -D`, `git clean`, `git reset --hard` (when it would discard uncommitted changes)
- Overwriting files without a backup
- Dropping database tables or records
- Any action that is not easily reversible

This rule cannot be overridden by a single instruction mid-conversation. A reconfirmation step is always required.

## Agent & Subagent Nesting — Explicit Permission

All agents and subagents have explicit permission to spawn nested subagents, subject to these hard limits:

- **Max 10 subagents per agent** — any single agent may spawn at most 10 subagents at one time.
- **Max 10 levels deep** — nesting may not exceed 10 layers (root agent = level 1, its subagents = level 2, ..., level 10 is the deepest allowed).

### Hard limit: total agent count across all levels

**The total number of agents active across all levels at any point must be between 1000 and 1050.** This is a hard rule with no exceptions.

- If the total would drop below 1000 or exceed 1050, the spawning or termination must be adjusted to stay within range.
- This cap applies to the entire agent tree combined — not per level, not per branch.

### Critical constraint: only spawn when genuinely required

Agents must NOT create subagents by default, speculatively, or just because the permission exists. A subagent should only be spawned when:
- The task is complex enough that parallelism or isolation is clearly beneficial.
- The work is independent enough to justify delegation.
- A simpler, direct approach cannot accomplish the same goal.

**Do not create agents for tasks you can handle directly.** Permission to nest is not a reason to nest.

### Agent autonomy

Every agent operates autonomously. Once spawned with a defined purpose, an agent:
- Does not need to wait for a specific message or command to begin acting.
- Makes its own decisions on how to proceed toward its goal.
- Can use tools, spawn subagents, read/write files, and take actions independently within its defined scope.
- Only pauses or escalates to its parent when it hits a blocker it cannot resolve on its own.

Agents are self-directed by default.

### Agent folder structure

Every agent must have its own dedicated folder inside `E:\snehasish\agents\` when created. No exceptions.

- The folder must be created before or at the same time the agent is spawned.
- Folder name should clearly identify the agent (e.g., `agent-001`, or a descriptive name matching the agent's task).
- Subagents must have their own subfolder inside their parent agent's folder, reflecting the nesting hierarchy.
- Example structure:
  ```
  E:\snehasish\agents\
  ├── agent-001\
  │   ├── agent-001.md         ← agent definition/description
  │   ├── log.md               ← communication log for this agent
  │   ├── agent-001-sub-001\
  │   │   ├── agent-001-sub-001.md
  │   │   └── log.md
  │   └── agent-001-sub-002\
  │       ├── agent-001-sub-002.md
  │       └── log.md
  └── agent-002\
      ├── agent-002.md
      └── log.md
  ```

### Required files inside every agent folder

Each agent folder must contain exactly these three files, created at the time the agent is spawned:

1. **`<agent-name>.md`** — the agent's definition file. Describes the agent's purpose, role, capabilities, and any relevant configuration.
2. **`log.md`** — the agent's own activity log. Records initialization, decisions made, instructions sent to subagents, responses/escalations received, and significant actions taken. Each agent writes only to its own `log.md`.
3. **`conversations.md`** — the agent's conversation transcript. Records all messages exchanged by this agent in chronological order.

## Agent Communication Rules

### CEO communication scope
The CEO only communicates with agents a maximum of 2 levels below:
- **Primarily** talks to direct reports (1 level down — e.g. CTO, CFO, CMO).
- **If unsatisfied**, the CEO may escalate down one more level (2 levels down — e.g. Engineering Manager under CTO).
- The CEO **never** communicates directly with agents 3 or more levels below.

### General rule for all agents
Every agent follows the same pattern — an agent primarily communicates with its direct reports, and may go one level deeper if unsatisfied. No agent skips levels or communicates beyond 2 levels down from itself.

### conversations.md format
Each entry in `conversations.md` must follow this format:
```
**[DATE | SENDER → RECEIVER]** *(escalated — reason, if applicable)*
SENDER: "message"
RECEIVER: "message"
...
---
```
