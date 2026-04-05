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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-black to-black pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-10 relative z-10">
        {/* Branding */}
        <div className="text-center space-y-3 animate-[fadeIn_0.6s_ease-out]">
          <div className="text-6xl mb-2">&#x1F47B;</div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Ghost
          </h1>
          <p className="text-zinc-400 text-lg font-light">
            Your AI meeting proxy. Forward and forget.
          </p>
        </div>

        {/* Form / Success state */}
        <div className="animate-[fadeIn_0.8s_ease-out]">
          {status === "success" && meetingId ? (
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 space-y-5 text-center">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  Ghost is on it
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your Ghost is joining the meeting now. You&apos;ll get an
                  email debrief when it&apos;s over.
                </p>
              </div>
              <a
                href={`/meeting/${meetingId}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                View meeting dashboard
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
              <button
                onClick={() => {
                  setStatus("idle");
                  setMeetingId(null);
                  setMeetingUrl("");
                }}
                className="block w-full mt-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                Send another Ghost
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="meetingUrl"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
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
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
                >
                  Your email{" "}
                  <span className="text-zinc-600 font-normal">
                    (for the debrief)
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="defaults to demo account"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Sending Ghost...
                  </span>
                ) : (
                  "Send Ghost"
                )}
              </button>
            </form>
          )}
        </div>

        {/* How it works */}
        <div className="space-y-5 animate-[fadeIn_1s_ease-out]">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600">
            How it works
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                step: "1",
                icon: "&#x1F4E8;",
                title: "Forward",
                desc: "Paste the meeting link",
              },
              {
                step: "2",
                icon: "&#x1F47B;",
                title: "Ghost Attends",
                desc: "AI joins and listens",
              },
              {
                step: "3",
                icon: "&#x1F4EC;",
                title: "Get Debriefed",
                desc: "Email with what mattered",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 text-center space-y-2"
              >
                <div
                  className="text-2xl"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs pb-4">
          Built at Ramp Hackathon 2025
        </p>
      </div>
    </div>
  );
}
