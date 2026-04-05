import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/url";

export async function GET() {
  return NextResponse.json({
    appUrl: getAppUrl(),
    APP_URL: process.env.APP_URL ? "set" : "unset",
    VERCEL_URL: process.env.VERCEL_URL || "unset",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "unset",
  });
}
