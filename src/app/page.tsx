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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0c0a09" }}
    >
      {/* Warm ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200, 162, 106, 0.06) 0%, transparent 60%), " +
            "radial-gradient(ellipse 50% 40% at 30% 10%, rgba(180, 140, 80, 0.03) 0%, transparent 50%), " +
            "radial-gradient(ellipse 50% 50% at 70% 5%, rgba(160, 120, 60, 0.02) 0%, transparent 50%)",
        }}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Branding */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.2em] mb-4 font-medium uppercase" style={{ color: "#8a7e72" }}>
            Your AI meeting proxy
          </p>
          <h1
            className="text-7xl mb-5 leading-none"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              color: "#f5efe6",
            }}
          >
            Ghost
          </h1>
          <p className="text-lg leading-relaxed max-w-sm mx-auto" style={{ color: "#8a7e72" }}>
            Forward a meeting you can&apos;t attend.<br />
            Get debriefed on what mattered.
          </p>
        </div>

        {/* Form / Success state */}
        <div>
          {status === "success" && meetingId ? (
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(46, 160, 67, 0.08)" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#5a9a6a"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <h2
                  className="text-2xl"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    color: "#f5efe6",
                  }}
                >
                  Ghost is on it
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#8a7e72" }}>
                  Your proxy is joining the meeting now.<br />
                  You&apos;ll receive an email debrief when it&apos;s over.
                </p>
              </div>

              <a
                href={`/meeting/${meetingId}`}
                className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
                style={{
                  background: "#c8a26a",
                  color: "#0c0a09",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#d4b07a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c8a26a")}
              >
                View meeting
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>

              <div>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setMeetingId(null);
                    setMeetingUrl("");
                  }}
                  className="text-sm transition-colors"
                  style={{ color: "#8a7e72" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#b0a090")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8a7e72")}
                >
                  Send another Ghost
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-5 rounded-lg p-6"
                style={{
                  background: "rgba(255, 245, 230, 0.02)",
                  border: "1px solid rgba(255, 245, 230, 0.07)",
                }}
              >
                <div>
                  <label
                    htmlFor="meetingUrl"
                    className="block text-sm mb-2"
                    style={{ color: "#b0a090" }}
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
                    className="w-full px-3.5 py-2.5 rounded-md text-sm transition-all"
                    style={{
                      background: "rgba(255, 245, 230, 0.03)",
                      border: "1px solid rgba(255, 245, 230, 0.08)",
                      color: "#e7e0d8",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(200, 162, 106, 0.4)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200, 162, 106, 0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 245, 230, 0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm mb-2"
                    style={{ color: "#b0a090" }}
                  >
                    Your email{" "}
                    <span style={{ color: "#5a5448" }}>
                      (for the debrief)
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="defaults to demo account"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md text-sm transition-all"
                    style={{
                      background: "rgba(255, 245, 230, 0.03)",
                      border: "1px solid rgba(255, 245, 230, 0.08)",
                      color: "#e7e0d8",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(200, 162, 106, 0.4)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200, 162, 106, 0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 245, 230, 0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {status === "error" && (
                <div className="px-4 py-3 rounded-md"
                  style={{
                    background: "rgba(200, 100, 80, 0.08)",
                    border: "1px solid rgba(200, 100, 80, 0.15)",
                  }}
                >
                  <p className="text-sm" style={{ color: "#c87060" }}>{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full text-sm font-medium py-3 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: status === "loading" ? "#3a3530" : "#c8a26a",
                  color: status === "loading" ? "#8a7e72" : "#0c0a09",
                }}
                onMouseEnter={(e) => {
                  if (status !== "loading") e.currentTarget.style.background = "#d4b07a";
                }}
                onMouseLeave={(e) => {
                  if (status !== "loading") e.currentTarget.style.background = "#c8a26a";
                }}
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
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background: "rgba(255, 245, 230, 0.06)" }} />
            <h2 className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: "#5a5448" }}>
              How it works
            </h2>
            <div className="flex-1 h-px" style={{ background: "rgba(255, 245, 230, 0.06)" }} />
          </div>

          <div className="grid grid-cols-3 gap-0">
            {[
              {
                step: "01",
                title: "Forward",
                desc: "Paste your meeting link",
              },
              {
                step: "02",
                title: "Ghost attends",
                desc: "AI joins and listens",
              },
              {
                step: "03",
                title: "Get debriefed",
                desc: "Email with what mattered",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="text-center px-4"
                style={{
                  borderRight: i < 2 ? "1px solid rgba(255, 245, 230, 0.06)" : "none",
                }}
              >
                <p className="text-xs font-mono mb-2 tracking-wide" style={{ color: "#c8a26a" }}>
                  {item.step}
                </p>
                <p
                  className="text-base mb-1"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    color: "#e7e0d8",
                  }}
                >
                  {item.title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#8a7e72" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-16 pb-4" style={{ color: "#2a2520" }}>
          Built at Ramp Hackathon 2026
        </p>
      </div>
    </div>
  );
}
