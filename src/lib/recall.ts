import { getAppUrl } from "./url";

const RECALL_API_BASE = process.env.RECALL_API_REGION
  ? `https://${process.env.RECALL_API_REGION}.recall.ai/api/v1`
  : "https://eu-central-1.recall.ai/api/v1";

function headers() {
  return {
    Authorization: `Token ${process.env.RECALL_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function createBot(
  meetingUrl: string,
  meetingId: string,
  botName: string = "Ghost (attending for Zach)"
): Promise<string> {
  const webhookUrl = `${getAppUrl()}/api/webhook/recall/transcript`;

  const res = await fetch(`${RECALL_API_BASE}/bot/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: botName,
      recording_config: {
        transcript: {
          provider: { meeting_captions: {} },
        },
        realtime_endpoints: [
          {
            type: "webhook",
            url: webhookUrl,
            events: ["transcript.data"],
          },
        ],
      },
      metadata: {
        ghost_meeting_id: meetingId,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Recall.ai bot creation failed: ${res.status} ${error}`);
  }

  const data = await res.json();
  return data.id;
}

export async function getBotStatus(
  botId: string
): Promise<{ status: string; meetingUrl?: string }> {
  const res = await fetch(`${RECALL_API_BASE}/bot/${botId}/`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`Recall.ai status check failed: ${res.status}`);
  }

  const data = await res.json();
  const latestStatus =
    data.status_changes?.[data.status_changes.length - 1]?.code || "unknown";

  return { status: latestStatus, meetingUrl: data.meeting_url };
}
