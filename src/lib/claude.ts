import Anthropic from "@anthropic-ai/sdk";
import {
  GhostProfile,
  Meeting,
  RelevantMoment,
  TranscriptUtterance,
} from "./types";

const client = new Anthropic();

export async function evaluateRelevance(
  utterance: TranscriptUtterance,
  profile: GhostProfile,
  runningSummary: string
): Promise<{ relevant: boolean; moment?: RelevantMoment }> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `You are Ghost, an AI meeting observer attending on behalf of ${profile.name}.

About them: ${profile.context}

Meeting context so far:
${runningSummary || "(Meeting just started)"}

Latest transcript segment:
[${utterance.speaker}]: "${utterance.text}"

Is this segment relevant to ${profile.name}? Only flag if:
1. Their name is mentioned
2. A decision is made about their work
3. They are assigned or volunteered for a task
4. Information directly impacts their projects
5. Someone asks something only they could answer

Respond with ONLY valid JSON, no other text:
If NOT relevant: {"relevant": false}
If relevant: {"relevant": true, "type": "action_required|fyi|context", "summary": "...", "why": "..."}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const result = JSON.parse(text);
    if (!result.relevant) return { relevant: false };

    return {
      relevant: true,
      moment: {
        timestamp: utterance.startTime,
        speaker: utterance.speaker,
        text: utterance.text,
        type: result.type || "fyi",
        summary: result.summary || utterance.text,
        why: result.why || "",
      },
    };
  } catch {
    return { relevant: false };
  }
}

export async function updateSummary(
  currentSummary: string,
  utterance: TranscriptUtterance
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You maintain a concise running summary of a meeting. Given the current summary and a new utterance, return an updated summary in 3-5 sentences. Focus on key topics, decisions, and action items. Return ONLY the updated summary, no preamble.

Current summary:
${currentSummary || "(No summary yet — meeting just started)"}

New utterance:
[${utterance.speaker}]: "${utterance.text}"

Updated summary:`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : currentSummary;
}

export async function generateDebrief(
  moments: RelevantMoment[],
  profile: GhostProfile,
  meeting: Meeting,
  transcript: TranscriptUtterance[],
  runningSummary: string
): Promise<string> {
  const duration = transcript.length > 0
    ? Math.round(
        (transcript[transcript.length - 1].endTime - transcript[0].startTime) /
          60
      )
    : 0;

  const relevantMinutes = moments.length > 0
    ? Math.round(
        moments.reduce((acc, m) => acc + 30, 0) / 60 // ~30s per relevant moment
      )
    : 0;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are Ghost. You attended a meeting on behalf of ${profile.name}.

About them: ${profile.context}
Meeting: ${meeting.title} (~${duration} minutes)

Full meeting summary:
${runningSummary}

Moments flagged as relevant to ${profile.name}:
${JSON.stringify(moments, null, 2)}

Write a short, casual debrief email body in HTML. Write it like a colleague who sat in for them — conversational, concise. Lead with the most important things (action items, decisions), then mention anything else noteworthy. End with how many minutes of the meeting were actually relevant to them (approximately ${relevantMinutes} of ${duration} minutes).

Keep it under 150 words. Use simple HTML: <p> tags, <strong> for emphasis. No <h1>-<h6> headers. No emojis except the ghost 👻 can appear in the greeting.

If no moments were relevant, say so cheerfully — "Nothing relevant to you came up. You made the right call skipping this one."

The transcript is available at: ${process.env.NEXT_PUBLIC_APP_URL}/meeting/${meeting.id}

Return ONLY the HTML body content, no wrapper tags.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
