"use client";

import { useState } from "react";

export default function Home() {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingUrl,
          userEmail: email || undefined,
          meetingTitle: "Meeting",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMeetingId(data.meetingId);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            Ghost <span className="text-4xl">👻</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Your AI meeting proxy. Forward and forget.
          </p>
        </div>

        {status === "success" && meetingId ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 text-center">
            <div className="text-2xl">👻</div>
            <p className="text-zinc-300">
              Ghost is joining your meeting. You&apos;ll get an email when
              it&apos;s done.
            </p>
            <a
              href={`/meeting/${meetingId}`}
              className="inline-block text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-4"
            >
              View meeting status →
            </a>
            <button
              onClick={() => {
                setStatus("idle");
                setMeetingId(null);
                setMeetingUrl("");
              }}
              className="block w-full mt-4 text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Send another Ghost
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="meetingUrl"
                className="block text-sm text-zinc-400 mb-1.5"
              >
                Meeting link
              </label>
              <input
                id="meetingUrl"
                type="url"
                required
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm text-zinc-400 mb-1.5"
              >
                Your email{" "}
                <span className="text-zinc-600">(for the debrief)</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {status === "loading" ? "Sending Ghost..." : "Send Ghost 👻"}
            </button>
          </form>
        )}

        <p className="text-center text-zinc-600 text-xs">
          Ghost joins your meeting, watches everything, and emails you only what
          mattered.
        </p>
      </div>
    </div>
  );
}
