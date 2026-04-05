export function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ) as string;
}
