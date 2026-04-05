# Ghost 👻

**Forward a meeting invite you can't make. Ghost attends, then emails you only what mattered.**

Built by Zach Smith for the Ramp AI Hackathon 2026.

## How It Works

1. Paste a meeting link (Zoom, Google Meet, or Teams)
2. Ghost joins via Recall.ai bot
3. Ghost watches in real-time, evaluating relevance with Claude AI
4. Meeting ends → Ghost emails you a debrief with only what mattered

No app to open. No dashboard to check. Forward and forget.

## Stack

- **Framework:** Next.js (App Router) on Vercel
- **AI:** Claude Sonnet via Anthropic SDK
- **Meeting Bot:** Recall.ai
- **Storage:** Upstash Redis
- **Email:** Resend
- **Styling:** Tailwind CSS

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your API keys
npm run dev
```

## Environment Variables

| Variable | Source |
|----------|--------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `RECALL_API_KEY` | recall.ai |
| `RESEND_API_KEY` | resend.com |
| `UPSTASH_REDIS_REST_URL` | Vercel/Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel/Upstash |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL |
