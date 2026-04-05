import { Redis } from "@upstash/redis";
import {
  Meeting,
  RelevantMoment,
  TranscriptUtterance,
} from "./types";

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const TTL = 60 * 60 * 24; // 24 hours

// --- Meeting CRUD ---

export async function saveMeeting(meeting: Meeting): Promise<void> {
  await getRedis().set(`meeting:${meeting.id}`, JSON.stringify(meeting), {
    ex: TTL,
  });
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  const data = await getRedis().get<string>(`meeting:${id}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function updateMeetingStatus(
  id: string,
  status: Meeting["status"],
  extra?: Partial<Meeting>
): Promise<void> {
  const meeting = await getMeeting(id);
  if (!meeting) return;
  const updated = { ...meeting, status, ...extra };
  await getRedis().set(`meeting:${id}`, JSON.stringify(updated), { ex: TTL });
}

// --- Transcript ---

export async function appendTranscript(
  meetingId: string,
  utterance: TranscriptUtterance
): Promise<void> {
  await getRedis().rpush(
    `meeting:${meetingId}:transcript`,
    JSON.stringify(utterance)
  );
  await getRedis().expire(`meeting:${meetingId}:transcript`, TTL);
}

export async function getTranscript(
  meetingId: string
): Promise<TranscriptUtterance[]> {
  const raw = await getRedis().lrange(`meeting:${meetingId}:transcript`, 0, -1);
  return raw.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );
}

// --- Relevant Moments ---

export async function addRelevantMoment(
  meetingId: string,
  moment: RelevantMoment
): Promise<void> {
  await getRedis().rpush(
    `meeting:${meetingId}:moments`,
    JSON.stringify(moment)
  );
  await getRedis().expire(`meeting:${meetingId}:moments`, TTL);
}

export async function getRelevantMoments(
  meetingId: string
): Promise<RelevantMoment[]> {
  const raw = await getRedis().lrange(`meeting:${meetingId}:moments`, 0, -1);
  return raw.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );
}

// --- Running Summary ---

export async function updateRunningSummary(
  meetingId: string,
  summary: string
): Promise<void> {
  await getRedis().set(`meeting:${meetingId}:summary`, summary, { ex: TTL });
}

export async function getRunningSummary(
  meetingId: string
): Promise<string> {
  return (await getRedis().get<string>(`meeting:${meetingId}:summary`)) || "";
}
