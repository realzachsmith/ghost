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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#faf8f5" }}
    >
      <div className="w-full max-w-lg relative z-10">
        {/* Branding */}
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.2em] mb-4 font-medium uppercase"
            style={{ color: "#9a8e80" }}
          >
            Your AI meeting proxy
          </p>
          <h1
            className="text-7xl mb-5 leading-none"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              color: "#2a2520",
            }}
          >
            Ghost
          </h1>
          <p
            className="text-lg leading-relaxed max-w-sm mx-auto"
            style={{ color: "#8a7e72" }}
          >
            Forward a meeting you can&apos;t attend.
            <br />
            Get debriefed on what mattered.
          </p>
        </div>

        {/* Form / Success state */}
        <div>
          {status === "success" && meetingId ? (
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(75, 140, 80, 0.08)" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#4b8c50"
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
                    fontFamily:
                      "var(--font-instrument-serif), Georgia, serif",
                    color: "#2a2520",
                  }}
                >
                  Ghost is on it
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8a7e72" }}
                >
                  Your proxy is joining the meeting now.
                  <br />
                  You&apos;ll receive an email debrief when it&apos;s over.
                </p>
              </div>

              <a
                href={`/meeting/${meetingId}`}
                className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
                style={{
                  background: "#9a7b4f",
                  color: "#fff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#8a6e44")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#9a7b4f")
                }
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#6a6058")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#8a7e72")
                  }
                >
                  Send another Ghost
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className="space-y-5 rounded-lg p-6"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(42, 37, 32, 0.08)",
                  boxShadow: "0 1px 3px rgba(42, 37, 32, 0.04)",
                }}
              >
                <div>
                  <label
                    htmlFor="meetingUrl"
                    className="block text-sm mb-2 font-medium"
                    style={{ color: "#4a4038" }}
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
                      background: "#faf8f5",
                      border: "1px solid rgba(42, 37, 32, 0.12)",
                      color: "#2a2520",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(154, 123, 79, 0.5)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(154, 123, 79, 0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(42, 37, 32, 0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm mb-2 font-medium"
                    style={{ color: "#4a4038" }}
                  >
                    Your email{" "}
                    <span style={{ color: "#b0a898", fontWeight: 400 }}>
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
                      background: "#faf8f5",
                      border: "1px solid rgba(42, 37, 32, 0.12)",
                      color: "#2a2520",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(154, 123, 79, 0.5)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(154, 123, 79, 0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(42, 37, 32, 0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {status === "error" && (
                <div
                  className="px-4 py-3 rounded-md"
                  style={{
                    background: "rgba(180, 70, 50, 0.06)",
                    border: "1px solid rgba(180, 70, 50, 0.12)",
                  }}
                >
                  <p className="text-sm" style={{ color: "#b44632" }}>
                    {errorMsg}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full text-sm font-medium py-3 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: status === "loading" ? "#d8d2c8" : "#9a7b4f",
                  color: status === "loading" ? "#8a7e72" : "#fff",
                }}
                onMouseEnter={(e) => {
                  if (status !== "loading")
                    e.currentTarget.style.background = "#8a6e44";
                }}
                onMouseLeave={(e) => {
                  if (status !== "loading")
                    e.currentTarget.style.background = "#9a7b4f";
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
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(42, 37, 32, 0.08)" }}
            />
            <h2
              className="text-xs font-medium tracking-[0.2em] uppercase"
              style={{ color: "#b0a898" }}
            >
              How it works
            </h2>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(42, 37, 32, 0.08)" }}
            />
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
                  borderRight:
                    i < 2
                      ? "1px solid rgba(42, 37, 32, 0.08)"
                      : "none",
                }}
              >
                <p
                  className="text-xs font-mono mb-2 tracking-wide"
                  style={{ color: "#9a7b4f" }}
                >
                  {item.step}
                </p>
                <p
                  className="text-base mb-1"
                  style={{
                    fontFamily:
                      "var(--font-instrument-serif), Georgia, serif",
                    color: "#2a2520",
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#9a8e80" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-16 pb-4"
          style={{ color: "#d0c8be" }}
        >
          Built at Ramp Hackathon 2026
        </p>
      </div>
    </div>
  );
}
