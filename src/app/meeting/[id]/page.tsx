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
    { bg: string; dot: string; label: string }
  > = {
    joining: {
      bg: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      dot: "bg-yellow-400",
      label: "Joining",
    },
    recording: {
      bg: "bg-red-500/10 text-red-400 border border-red-500/20",
      dot: "bg-red-400 animate-pulse",
      label: "Recording",
    },
    processing: {
      bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      dot: "bg-blue-400 animate-pulse",
      label: "Processing",
    },
    done: {
      bg: "bg-green-500/10 text-green-400 border border-green-500/20",
      dot: "bg-green-400",
      label: "Complete",
    },
    error: {
      bg: "bg-red-500/10 text-red-400 border border-red-500/20",
      dot: "bg-red-400",
      label: "Error",
    },
  };

  const statusInfo = statusConfig[meeting.status] || {
    bg: "bg-zinc-800 text-zinc-400",
    dot: "bg-zinc-400",
    label: meeting.status,
  };

  const momentTimestamps = new Set(moments.map((m) => m.timestamp));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-5">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
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
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Ghost
          </a>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {meeting.title}
              </h1>
              <p className="text-zinc-500 text-sm">
                {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.bg}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
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
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Meeting Summary
            </h2>
            <p className="text-zinc-300 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Relevant Moments */}
        {moments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Key Moments
              <span className="ml-2 inline-flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full px-2 py-0.5">
                {moments.length}
              </span>
            </h2>
            <div className="space-y-3">
              {moments.map((moment, i) => (
                <div
                  key={i}
                  className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wide">
                      {moment.type.replace("_", " ")}
                    </span>
                    <span className="text-zinc-600 text-xs font-mono">
                      {formatTime(moment.timestamp)}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {moment.summary}
                  </p>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    {moment.why}
                  </p>
                  <p className="text-zinc-600 text-xs">
                    &mdash; {moment.speaker}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Transcript */}
        {transcript.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Full Transcript
              <span className="ml-2 text-zinc-600 font-normal normal-case tracking-normal">
                {transcript.length} segments
              </span>
            </h2>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/50 overflow-hidden">
              {transcript.map((utterance, i) => {
                const isRelevant = momentTimestamps.has(utterance.startTime);
                return (
                  <div
                    key={i}
                    className={`px-5 py-4 ${isRelevant ? "bg-indigo-500/5 border-l-2 border-l-indigo-500" : ""}`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-zinc-300 text-xs font-medium">
                        {utterance.speaker}
                      </span>
                      <span className="text-zinc-700 text-xs font-mono">
                        {formatTime(utterance.startTime)}
                      </span>
                      {isRelevant && (
                        <span className="text-indigo-400 text-xs font-medium">
                          &#9733; relevant
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
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
          <div className="text-center py-20 space-y-4">
            <div className="text-5xl">&#x1F47B;</div>
            <p className="text-zinc-400 text-lg">
              {meeting.status === "joining"
                ? "Ghost is joining the meeting..."
                : meeting.status === "recording"
                  ? "Ghost is listening... Refresh to see updates."
                  : "Waiting for transcript data..."}
            </p>
            {meeting.status === "recording" && (
              <a
                href={`/meeting/${id}`}
                className="inline-block text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
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
