import { NextRequest, NextResponse } from "next/server";
import { TranscriptUtterance } from "@/lib/types";
import { DEMO_PROFILE } from "@/lib/profile";
import {
  appendTranscript,
  getRunningSummary,
  updateRunningSummary,
  addRelevantMoment,
} from "@/lib/storage";
import { evaluateRelevance, updateSummary } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract meeting ID from bot metadata
    const meetingId =
      body?.data?.bot?.metadata?.ghost_meeting_id ||
      body?.bot?.metadata?.ghost_meeting_id;

    if (!meetingId) {
      console.error("No ghost_meeting_id in webhook payload:", JSON.stringify(body).slice(0, 500));
      return NextResponse.json({ ok: true });
    }

    // Parse transcript data from Recall.ai webhook
    // Recall sends different formats — handle the common ones
    const transcriptData = body?.data?.data || body?.data?.transcript || body?.data;

    let speaker = "Unknown";
    let text = "";
    let startTime = 0;
    let endTime = 0;

    if (transcriptData?.words && Array.isArray(transcriptData.words)) {
      // Format: { words: [{ text, start_timestamp, end_timestamp }], participant: { name } }
      speaker = transcriptData.participant?.name || transcriptData.speaker || "Unknown";
      text = transcriptData.words.map((w: { text: string }) => w.text).join(" ");
      startTime = transcriptData.words[0]?.start_timestamp?.relative || 0;
      endTime =
        transcriptData.words[transcriptData.words.length - 1]?.end_timestamp
          ?.relative || 0;
    } else if (transcriptData?.text) {
      // Simpler format: { text, speaker, ... }
      speaker = transcriptData.speaker || transcriptData.participant?.name || "Unknown";
      text = transcriptData.text;
      startTime = transcriptData.start_time || transcriptData.startTime || 0;
      endTime = transcriptData.end_time || transcriptData.endTime || 0;
    } else if (typeof transcriptData === "string") {
      text = transcriptData;
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ ok: true });
    }

    const utterance: TranscriptUtterance = {
      speaker,
      text: text.trim(),
      startTime,
      endTime,
    };

    // Store transcript immediately
    await appendTranscript(meetingId, utterance);

    // Fire-and-forget: Claude evaluation + summary update
    // Don't await — return 200 fast for Recall.ai
    processUtterance(meetingId, utterance).catch((err) =>
      console.error("Claude processing error:", err)
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Transcript webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function processUtterance(
  meetingId: string,
  utterance: TranscriptUtterance
) {
  const summary = await getRunningSummary(meetingId);

  // Run relevance evaluation and summary update in parallel
  const [relevanceResult, newSummary] = await Promise.all([
    evaluateRelevance(utterance, DEMO_PROFILE, summary),
    updateSummary(summary, utterance),
  ]);

  // Store updated summary
  await updateRunningSummary(meetingId, newSummary);

  // Store relevant moment if found
  if (relevanceResult.relevant && relevanceResult.moment) {
    await addRelevantMoment(meetingId, relevanceResult.moment);
  }
}
