import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createBot } from "@/lib/recall";
import { saveMeeting, getOrCreateProfile } from "@/lib/storage";
import { DEMO_PROFILE } from "@/lib/profile";
import { Meeting } from "@/lib/types";

const MEETING_URL_REGEX =
  /https?:\/\/(meet\.google\.com\/[a-z\-]+|zoom\.us\/j\/\d+|[\w-]+\.zoom\.us\/j\/\d+|teams\.microsoft\.com\/l\/meetup-join\/[^\s]+)/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingUrl, userEmail, meetingTitle } = body;

    if (!meetingUrl) {
      return NextResponse.json(
        { error: "Meeting URL is required" },
        { status: 400 }
      );
    }

    // Relaxed validation — just check it's a URL from a known provider
    if (!MEETING_URL_REGEX.test(meetingUrl)) {
      return NextResponse.json(
        { error: "Please provide a valid Zoom, Google Meet, or Teams URL" },
        { status: 400 }
      );
    }

    const meetingId = nanoid(10);

    // Look up or create a profile for the user; fall back to demo profile
    const profile = userEmail
      ? await getOrCreateProfile(userEmail)
      : DEMO_PROFILE;

    const meeting: Meeting = {
      id: meetingId,
      botId: "",
      meetingUrl,
      title: meetingTitle || "Meeting",
      userEmail: profile.email,
      status: "joining",
      createdAt: new Date().toISOString(),
    };

    await saveMeeting(meeting);

    // Create the Recall.ai bot
    const botId = await createBot(meetingUrl, meetingId);

    // Update meeting with bot ID
    meeting.botId = botId;
    await saveMeeting(meeting);

    return NextResponse.json({
      meetingId,
      botId,
      status: "joining",
      message: "Ghost is joining your meeting",
    });
  } catch (error) {
    console.error("Trigger error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create Ghost bot",
      },
      { status: 500 }
    );
  }
}
