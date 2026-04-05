import { NextRequest, NextResponse } from "next/server";
import {
  getMeeting,
  updateMeetingStatus,
  getRelevantMoments,
  getTranscript,
  getRunningSummary,
} from "@/lib/storage";
import { generateDebrief } from "@/lib/claude";
import { sendDebrief } from "@/lib/email";
import { DEMO_PROFILE } from "@/lib/profile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Status webhook received:", JSON.stringify(body).slice(0, 1000));

    // Extract event type and bot data
    const event = body?.event || body?.data?.event;
    const botData = body?.data?.bot || body?.bot || body?.data;
    const meetingId =
      botData?.metadata?.ghost_meeting_id;

    if (!meetingId) {
      console.error("No ghost_meeting_id in status webhook");
      return NextResponse.json({ ok: true });
    }

    // Map Recall.ai status events
    const statusCode =
      body?.data?.status?.code ||
      botData?.status_changes?.[botData.status_changes.length - 1]?.code;

    console.log(`Meeting ${meetingId}: event=${event}, status=${statusCode}`);

    // Handle bot status changes
    if (statusCode === "in_call_recording" || event === "bot.in_call_recording") {
      await updateMeetingStatus(meetingId, "recording");
    }

    // Meeting ended — generate debrief
    if (
      statusCode === "done" ||
      event === "bot.done" ||
      statusCode === "call_ended" ||
      event === "bot.status_change.done"
    ) {
      await handleMeetingEnd(meetingId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Status webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function handleMeetingEnd(meetingId: string) {
  const meeting = await getMeeting(meetingId);
  if (!meeting) {
    console.error(`Meeting ${meetingId} not found`);
    return;
  }

  await updateMeetingStatus(meetingId, "processing");

  try {
    const [moments, transcript, summary] = await Promise.all([
      getRelevantMoments(meetingId),
      getTranscript(meetingId),
      getRunningSummary(meetingId),
    ]);

    console.log(
      `Meeting ${meetingId}: ${transcript.length} utterances, ${moments.length} relevant moments`
    );

    // Generate debrief
    const debriefHtml = await generateDebrief(
      moments,
      DEMO_PROFILE,
      meeting,
      transcript,
      summary
    );

    // Send email
    await sendDebrief(
      meeting.userEmail,
      meeting.title,
      debriefHtml,
      meetingId
    );

    await updateMeetingStatus(meetingId, "done", {
      endedAt: new Date().toISOString(),
    });

    console.log(`Meeting ${meetingId}: debrief sent to ${meeting.userEmail}`);
  } catch (error) {
    console.error(`Meeting ${meetingId} debrief error:`, error);
    await updateMeetingStatus(meetingId, "error");
  }
}
