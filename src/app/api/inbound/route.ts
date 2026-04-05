import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createBot } from "@/lib/recall";
import { saveMeeting } from "@/lib/storage";
import { DEMO_PROFILE } from "@/lib/profile";
import { Meeting } from "@/lib/types";
import { sendConfirmation } from "@/lib/email";

// ---------------------------------------------------------------------------
// Meeting URL regex — matches Google Meet, Zoom, and Microsoft Teams links
// ---------------------------------------------------------------------------
const MEETING_URL_REGEX =
  /https?:\/\/(meet\.google\.com\/[a-z\-]+|zoom\.us\/j\/\d+|[\w-]+\.zoom\.us\/j\/\d+|teams\.microsoft\.com\/l\/meetup-join\/[^\s"'<>]+)/gi;

// ---------------------------------------------------------------------------
// Helpers to normalise payloads from SendGrid Inbound Parse and Resend
// ---------------------------------------------------------------------------

interface ParsedEmail {
  from: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}

/**
 * SendGrid Inbound Parse sends multipart/form-data with fields:
 *   from, subject, text, html, envelope, …
 */
async function parseSendGrid(formData: FormData): Promise<ParsedEmail> {
  const rawFrom = (formData.get("from") as string) || "";
  // "from" may look like `"Name" <email@example.com>` — extract the address
  const emailMatch = rawFrom.match(/<([^>]+)>/) || rawFrom.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const from = emailMatch ? emailMatch[1] || emailMatch[0] : rawFrom;

  return {
    from,
    subject: (formData.get("subject") as string) || "",
    textBody: (formData.get("text") as string) || "",
    htmlBody: (formData.get("html") as string) || "",
  };
}

/**
 * Resend (and generic JSON webhook providers) send JSON with fields:
 *   from, subject, text, html  (or text_body / html_body)
 */
function parseResendJson(body: Record<string, unknown>): ParsedEmail {
  const rawFrom = (body.from as string) || "";
  const emailMatch = rawFrom.match(/<([^>]+)>/) || rawFrom.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const from = emailMatch ? emailMatch[1] || emailMatch[0] : rawFrom;

  return {
    from,
    subject: (body.subject as string) || "",
    textBody: (body.text as string) || (body.text_body as string) || "",
    htmlBody: (body.html as string) || (body.html_body as string) || "",
  };
}

// ---------------------------------------------------------------------------
// Extract the first meeting link from text + HTML bodies
// ---------------------------------------------------------------------------

function extractMeetingUrl(text: string, html: string): string | null {
  // Search the combined text; HTML often has the real link
  const combined = `${text}\n${html}`;
  const matches = combined.match(MEETING_URL_REGEX);
  return matches ? matches[0] : null;
}

// ---------------------------------------------------------------------------
// Derive a readable meeting title from the subject line
// ---------------------------------------------------------------------------

function deriveMeetingTitle(subject: string): string {
  // Strip common forwarding prefixes
  const cleaned = subject
    .replace(/^(fwd?|fw):\s*/i, "")
    .replace(/^(re):\s*/i, "")
    .replace(/^(invitation|invite|accepted|tentative|declined):\s*/i, "")
    .trim();

  return cleaned || "Meeting";
}

// ---------------------------------------------------------------------------
// POST /api/inbound — email webhook endpoint
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // ---- Determine content type and parse accordingly -----------------------
    const contentType = req.headers.get("content-type") || "";
    let parsed: ParsedEmail;

    if (contentType.includes("multipart/form-data")) {
      // SendGrid Inbound Parse
      const formData = await req.formData();
      parsed = await parseSendGrid(formData);
    } else {
      // Resend / generic JSON webhook
      const body = await req.json();
      parsed = parseResendJson(body);
    }

    const { from, subject, textBody, htmlBody } = parsed;

    console.log(`[inbound] Email from ${from} — subject: "${subject}"`);

    // ---- Extract meeting URL ------------------------------------------------
    const meetingUrl = extractMeetingUrl(textBody, htmlBody);

    if (!meetingUrl) {
      console.warn("[inbound] No meeting link found in email");
      return NextResponse.json(
        {
          error:
            "No meeting link found. Please forward an email that contains a Google Meet, Zoom, or Teams link.",
        },
        { status: 422 }
      );
    }

    console.log(`[inbound] Extracted meeting URL: ${meetingUrl}`);

    // ---- Create meeting record ----------------------------------------------
    const meetingId = nanoid(10);
    const meetingTitle = deriveMeetingTitle(subject);
    const userEmail = from || DEMO_PROFILE.email;

    const meeting: Meeting = {
      id: meetingId,
      botId: "",
      meetingUrl,
      title: meetingTitle,
      userEmail,
      status: "joining",
      createdAt: new Date().toISOString(),
    };

    await saveMeeting(meeting);

    // ---- Create Recall.ai bot -----------------------------------------------
    const botId = await createBot(meetingUrl, meetingId);

    meeting.botId = botId;
    await saveMeeting(meeting);

    console.log(`[inbound] Bot ${botId} created for meeting ${meetingId}`);

    // ---- Send confirmation email back to sender -----------------------------
    try {
      await sendConfirmation(userEmail, meetingTitle);
      console.log(`[inbound] Confirmation sent to ${userEmail}`);
    } catch (emailErr) {
      // Non-fatal — the bot is already joining, so just log it
      console.error("[inbound] Failed to send confirmation email:", emailErr);
    }

    return NextResponse.json({
      meetingId,
      botId,
      status: "joining",
      message: `Ghost is joining "${meetingTitle}"`,
    });
  } catch (error) {
    console.error("[inbound] Error processing inbound email:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process inbound email",
      },
      { status: 500 }
    );
  }
}
