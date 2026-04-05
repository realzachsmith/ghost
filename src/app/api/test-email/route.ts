import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveMeeting, appendTranscript, addRelevantMoment, updateRunningSummary } from "@/lib/storage";
import { generateDebrief } from "@/lib/claude";
import { sendDebrief } from "@/lib/email";
import { DEMO_PROFILE } from "@/lib/profile";
import { Meeting, TranscriptUtterance, RelevantMoment } from "@/lib/types";

export async function POST() {
  const meetingId = `test-${nanoid(6)}`;

  // 1. Create a fake meeting
  const meeting: Meeting = {
    id: meetingId,
    botId: "test-bot",
    meetingUrl: "https://meet.google.com/test",
    title: "Q1 Planning Sync",
    userEmail: "zach@north-digital.com",
    status: "recording",
    createdAt: new Date().toISOString(),
  };
  await saveMeeting(meeting);

  // 2. Seed transcript
  const transcriptLines: TranscriptUtterance[] = [
    { speaker: "Sarah Chen", text: "Let's go over the Q1 action items. Zach, we need you to send the Q1 report to Fred by end of week.", startTime: 0, endTime: 12 },
    { speaker: "Mike Johnson", text: "Sounds good. I'll handle the marketing deck updates.", startTime: 13, endTime: 20 },
    { speaker: "Sarah Chen", text: "Zach also needs to update the sales data spreadsheet before the board meeting next Tuesday.", startTime: 21, endTime: 32 },
    { speaker: "Mike Johnson", text: "And we should send the new hire list to HR. Can Zach handle that too?", startTime: 33, endTime: 41 },
    { speaker: "Sarah Chen", text: "Yes, let's assign that to Zach. Also, the design review is moved to Thursday.", startTime: 42, endTime: 52 },
  ];

  for (const line of transcriptLines) {
    await appendTranscript(meetingId, line);
  }

  // 3. Seed relevant moments
  const moments: RelevantMoment[] = [
    { timestamp: 0, speaker: "Sarah Chen", text: "Zach, we need you to send the Q1 report to Fred by end of week.", type: "action_required", summary: "Send Q1 report to Fred by EOW", why: "Direct action item assigned to Zach" },
    { timestamp: 21, speaker: "Sarah Chen", text: "Zach also needs to update the sales data spreadsheet before the board meeting next Tuesday.", type: "action_required", summary: "Update sales data spreadsheet before Tuesday board meeting", why: "Action item assigned to Zach" },
    { timestamp: 33, speaker: "Mike Johnson", text: "Can Zach handle the new hire list to HR?", type: "action_required", summary: "Send new hire list to HR", why: "Task assigned to Zach" },
  ];

  for (const moment of moments) {
    await addRelevantMoment(meetingId, moment);
  }

  // 4. Seed running summary
  await updateRunningSummary(
    meetingId,
    "Sarah Chen opened the Q1 planning sync and assigned key action items. Zach needs to send the Q1 report to Fred by end of week, update the sales data spreadsheet before the Tuesday board meeting, and send the new hire list to HR. Mike Johnson will handle marketing deck updates. The design review has been moved to Thursday."
  );

  // 5. Generate debrief via Claude
  const debriefHtml = await generateDebrief(
    moments,
    DEMO_PROFILE,
    meeting,
    transcriptLines,
    "Sarah Chen opened the Q1 planning sync and assigned key action items. Zach needs to send the Q1 report to Fred by end of week, update the sales data spreadsheet before the Tuesday board meeting, and send the new hire list to HR. Mike Johnson will handle marketing deck updates. The design review has been moved to Thursday."
  );

  // 6. Send email
  await sendDebrief(meeting.userEmail, meeting.title, debriefHtml, meetingId);

  return NextResponse.json({
    success: true,
    meetingId,
    emailSentTo: meeting.userEmail,
    debriefPreview: debriefHtml.slice(0, 200),
  });
}
