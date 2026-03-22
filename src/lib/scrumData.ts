import { ScrumMeeting } from "./types";

export const scrumMeetings: ScrumMeeting[] = [
  {
    id: "scrum-001",
    date: "2026-04-05",
    type: "within-team",
    department: "Executive",
    participants: [
      { agentId: "ceo", agentName: "CEO", department: "Executive" },
    ],
    status: "scheduled",
    summary: undefined,
  },
];
