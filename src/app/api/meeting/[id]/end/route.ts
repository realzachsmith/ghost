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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meeting = await getMeeting(id);

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  if (meeting.status === "done") {
    return NextResponse.json({ error: "Meeting already processed" }, { status: 400 });
  }

  await updateMeetingStatus(id, "processing");

  try {
    const [moments, transcript, summary] = await Promise.all([
      getRelevantMoments(id),
      getTranscript(id),
      getRunningSummary(id),
    ]);

    const debriefHtml = await generateDebrief(
      moments,
      DEMO_PROFILE,
      meeting,
      transcript,
      summary
    );

    await sendDebrief(meeting.userEmail, meeting.title, debriefHtml, id);

    await updateMeetingStatus(id, "done", {
      endedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      status: "done",
      momentsCount: moments.length,
      transcriptCount: transcript.length,
    });
  } catch (error) {
    console.error(`Manual end meeting ${id} error:`, error);
    await updateMeetingStatus(id, "error");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate debrief" },
      { status: 500 }
    );
  }
}
