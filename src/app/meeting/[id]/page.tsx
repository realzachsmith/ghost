import {
  getMeeting,
  getTranscript,
  getRelevantMoments,
  getRunningSummary,
} from "@/lib/storage";
import { notFound } from "next/navigation";
import EndMeetingButton from "./EndMeetingButton";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = await getMeeting(id);

  if (!meeting) {
    notFound();
  }

  const [transcript, moments, summary] = await Promise.all([
    getTranscript(id),
    getRelevantMoments(id),
    getRunningSummary(id),
  ]);

  const statusConfig: Record<
    string,
    { color: string; dotColor: string; label: string; pulse?: boolean }
  > = {
    joining: {
      color: "#d4a72c",
      dotColor: "#d4a72c",
      label: "Joining",
    },
    recording: {
      color: "#f85149",
      dotColor: "#f85149",
      label: "Recording",
      pulse: true,
    },
    processing: {
      color: "#58a6ff",
      dotColor: "#58a6ff",
      label: "Processing",
      pulse: true,
    },
    done: {
      color: "#2ea043",
      dotColor: "#2ea043",
      label: "Complete",
    },
    error: {
      color: "#f85149",
      dotColor: "#f85149",
      label: "Error",
    },
  };

  const statusInfo = statusConfig[meeting.status] || {
    color: "#6e6e80",
    dotColor: "#6e6e80",
    label: meeting.status,
  };

  const momentTimestamps = new Set(moments.map((m) => m.timestamp));

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0f", color: "#e8e8ed" }}
    >
      {/* Subtle top gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 30% at 50% 0%, rgba(99, 91, 255, 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10 relative">
        {/* Header */}
        <div className="space-y-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[#8a8a9a]"
            style={{ color: "#6e6e80" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Ghost
          </a>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1
                className="text-3xl text-white leading-tight"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                }}
              >
                {meeting.title}
              </h1>
              <p className="text-sm" style={{ color: "#6e6e80" }}>
                {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(meeting.createdAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <span
              className="inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full"
              style={{
                color: statusInfo.color,
                background: `${statusInfo.color}10`,
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusInfo.pulse ? "animate-pulse" : ""}`}
                style={{ background: statusInfo.dotColor }}
              />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* End Meeting Button */}
        {meeting.status !== "done" && meeting.status !== "error" && (
          <EndMeetingButton meetingId={id} />
        )}

        {/* Summary */}
        {summary && (
          <div className="space-y-3">
            <h2
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "#4a4a5a" }}
            >
              Summary
            </h2>
            <p
              className="text-sm leading-[1.8]"
              style={{ color: "#a0a0b0" }}
            >
              {summary}
            </p>
          </div>
        )}

        {/* Separator */}
        {summary && (moments.length > 0 || transcript.length > 0) && (
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        )}

        {/* Relevant Moments */}
        {moments.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: "#4a4a5a" }}
              >
                Key Moments
              </h2>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{
                  color: "#635bff",
                  background: "rgba(99, 91, 255, 0.1)",
                }}
              >
                {moments.length}
              </span>
            </div>

            <div className="space-y-0">
              {moments.map((moment, i) => (
                <div
                  key={i}
                  className="py-5"
                  style={{
                    borderLeft: "2px solid rgba(99, 91, 255, 0.3)",
                    paddingLeft: "20px",
                    borderBottom:
                      i < moments.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "#635bff" }}
                    >
                      {moment.type.replace("_", " ")}
                    </span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "#4a4a5a" }}
                    >
                      {formatTime(moment.timestamp)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-1.5"
                    style={{ color: "#e8e8ed" }}
                  >
                    {moment.summary}
                  </p>
                  <p
                    className="text-xs leading-relaxed mb-2"
                    style={{ color: "#6e6e80" }}
                  >
                    {moment.why}
                  </p>
                  <p className="text-xs" style={{ color: "#4a4a5a" }}>
                    &mdash; {moment.speaker}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separator */}
        {moments.length > 0 && transcript.length > 0 && (
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        )}

        {/* Full Transcript */}
        {transcript.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <h2
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: "#4a4a5a" }}
              >
                Transcript
              </h2>
              <span
                className="text-xs font-mono"
                style={{ color: "#3a3a4a" }}
              >
                {transcript.length} segments
              </span>
            </div>

            <div className="space-y-0">
              {transcript.map((utterance, i) => {
                const isRelevant = momentTimestamps.has(utterance.startTime);
                return (
                  <div
                    key={i}
                    className="py-3.5"
                    style={{
                      borderLeft: isRelevant
                        ? "2px solid rgba(99, 91, 255, 0.4)"
                        : "2px solid transparent",
                      paddingLeft: "16px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <span
                        className="text-xs font-medium"
                        style={{ color: isRelevant ? "#a09aff" : "#8a8a9a" }}
                      >
                        {utterance.speaker}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "#3a3a4a" }}
                      >
                        {formatTime(utterance.startTime)}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-[1.75]"
                      style={{ color: isRelevant ? "#c8c8d4" : "#6e6e80" }}
                    >
                      {utterance.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {transcript.length === 0 && meeting.status !== "done" && (
          <div className="text-center py-24 space-y-4">
            <p
              className="text-3xl"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                color: "#2a2a3a",
              }}
            >
              Listening...
            </p>
            <p className="text-sm" style={{ color: "#4a4a5a" }}>
              {meeting.status === "joining"
                ? "Ghost is joining the meeting"
                : meeting.status === "recording"
                  ? "Ghost is in the meeting. Refresh to see updates."
                  : "Waiting for transcript data"}
            </p>
            {meeting.status === "recording" && (
              <a
                href={`/meeting/${id}`}
                className="inline-block text-sm transition-colors"
                style={{ color: "#635bff" }}
              >
                Refresh now
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
