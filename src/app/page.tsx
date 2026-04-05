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
      style={{ background: "#0a0a0f" }}
    >
      {/* Stripe-style mesh gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 91, 255, 0.08) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 40% at 30% 10%, rgba(120, 80, 220, 0.05) 0%, transparent 50%), " +
            "radial-gradient(ellipse 50% 50% at 70% 5%, rgba(60, 100, 255, 0.04) 0%, transparent 50%)",
        }}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Branding */}
        <div className="text-center mb-14">
          <p className="text-[#6e6e80] text-sm tracking-wide mb-4 font-medium">
            YOUR AI MEETING PROXY
          </p>
          <h1
            className="text-7xl text-white mb-5 leading-none"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            Ghost
          </h1>
          <p className="text-[#8a8a9a] text-lg leading-relaxed max-w-sm mx-auto">
            Forward a meeting you can&apos;t attend.<br />
            Get debriefed on what mattered.
          </p>
        </div>

        {/* Form / Success state */}
        <div>
          {status === "success" && meetingId ? (
            <div className="text-center space-y-8">
              {/* Success check */}
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(46, 160, 67, 0.1)" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#2ea043"
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
                  className="text-2xl text-white"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  Ghost is on it
                </h2>
                <p className="text-[#6e6e80] text-sm leading-relaxed">
                  Your proxy is joining the meeting now.<br />
                  You&apos;ll receive an email debrief when it&apos;s over.
                </p>
              </div>

              <a
                href={`/meeting/${meetingId}`}
                className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
                style={{
                  background: "#635bff",
                  color: "#fff",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#7a73ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#635bff")}
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
                  className="text-[#6e6e80] hover:text-[#8a8a9a] text-sm transition-colors"
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
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div>
                  <label
                    htmlFor="meetingUrl"
                    className="block text-sm text-[#8a8a9a] mb-2"
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
                    className="w-full px-3.5 py-2.5 rounded-md text-white text-sm placeholder:text-[#3a3a4a] transition-all"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(99, 91, 255, 0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 91, 255, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-[#8a8a9a] mb-2"
                  >
                    Your email{" "}
                    <span className="text-[#4a4a5a]">
                      (for the debrief)
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="defaults to demo account"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md text-white text-sm placeholder:text-[#3a3a4a] transition-all"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(99, 91, 255, 0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 91, 255, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {status === "error" && (
                <div className="px-4 py-3 rounded-md"
                  style={{
                    background: "rgba(248, 81, 73, 0.08)",
                    border: "1px solid rgba(248, 81, 73, 0.15)",
                  }}
                >
                  <p className="text-[#f85149] text-sm">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full text-white text-sm font-medium py-3 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: status === "loading" ? "#3a3a4a" : "#635bff",
                }}
                onMouseEnter={(e) => {
                  if (status !== "loading") e.currentTarget.style.background = "#7a73ff";
                }}
                onMouseLeave={(e) => {
                  if (status !== "loading") e.currentTarget.style.background = "#635bff";
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
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <h2 className="text-xs font-medium tracking-widest text-[#4a4a5a] uppercase">
              How it works
            </h2>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
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
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <p className="text-[#635bff] text-xs font-mono mb-2 tracking-wide">
                  {item.step}
                </p>
                <p
                  className="text-white text-base mb-1"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  {item.title}
                </p>
                <p className="text-[#6e6e80] text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#2a2a3a] text-xs mt-16 pb-4">
          Built at Ramp Hackathon 2026
        </p>
      </div>
    </div>
  );
}
