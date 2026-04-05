export interface GhostProfile {
  name: string;
  email: string;
  context: string;
  pastMeetings: number;
}

export interface Meeting {
  id: string;
  botId: string;
  meetingUrl: string;
  title: string;
  userEmail: string;
  status: "joining" | "recording" | "processing" | "done" | "error";
  createdAt: string;
  endedAt?: string;
}

export interface RelevantMoment {
  timestamp: number;
  speaker: string;
  text: string;
  type: "action_required" | "fyi" | "context";
  summary: string;
  why: string;
}

export interface TranscriptUtterance {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}
