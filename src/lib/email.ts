import { Resend } from "resend";
import { getAppUrl } from "./url";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendDebrief(
  to: string,
  meetingTitle: string,
  debriefHtml: string,
  meetingId: string
): Promise<void> {
  const transcriptUrl = `${getAppUrl()}/meeting/${meetingId}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
      ${debriefHtml}
      <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
        <a href="${transcriptUrl}" style="color: #6366f1; text-decoration: none; font-weight: 500;">View full transcript →</a>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 16px;">Sent by Ghost 👻</p>
    </div>
  `;

  await getResend().emails.send({
    from: "Ghost <onboarding@resend.dev>",
    to: [to],
    subject: `👻 Ghost: ${meetingTitle}`,
    html,
  });
}
