import {
  getMeeting,
  getTranscript,
  getRelevantMoments,
  getRunningSummary,
} from "@/lib/storage";
import { notFound } from "next/navigation";

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

  const statusColors: Record<string, string> = {
    joining: "bg-yellow-500/20 text-yellow-400",
    recording: "bg-red-500/20 text-red-400",
    processing: "bg-blue-500/20 text-blue-400",
    done: "bg-green-500/20 text-green-400",
    error: "bg-red-500/20 text-red-400",
  };

  const momentTimestamps = new Set(moments.map((m) => m.timestamp));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <a
            href="/"
            className="text-zinc-500 hover:text-zinc-300 text-sm"
          >
            ← Back to Ghost
          </a>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                👻 {meeting.title}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {new Date(meeting.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[meeting.status] || "bg-zinc-800 text-zinc-400"}`}
            >
              {meeting.status}
            </span>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
            <h2 className="text-sm font-medium text-zinc-400">
              Meeting Summary
            </h2>
            <p className="text-zinc-300 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Relevant Moments */}
        {moments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400">
              Relevant Moments ({moments.length})
            </h2>
            {moments.map((moment, i) => (
              <div
                key={i}
                className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 text-xs font-medium uppercase">
                    {moment.type.replace("_", " ")}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {formatTime(moment.timestamp)}
                  </span>
                </div>
                <p className="text-white text-sm">{moment.summary}</p>
                <p className="text-zinc-500 text-xs">{moment.why}</p>
                <p className="text-zinc-400 text-xs italic">
                  — {moment.speaker}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Full Transcript */}
        {transcript.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400">
              Full Transcript ({transcript.length} segments)
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800/50">
              {transcript.map((utterance, i) => {
                const isRelevant = momentTimestamps.has(utterance.startTime);
                return (
                  <div
                    key={i}
                    className={`p-4 ${isRelevant ? "bg-indigo-500/5 border-l-2 border-indigo-500" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-zinc-400 text-xs font-medium">
                        {utterance.speaker}
                      </span>
                      <span className="text-zinc-600 text-xs">
                        {formatTime(utterance.startTime)}
                      </span>
                      {isRelevant && (
                        <span className="text-indigo-400 text-xs">
                          ★ relevant
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
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
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">👻</div>
            <p className="text-zinc-400">
              {meeting.status === "joining"
                ? "Ghost is joining the meeting..."
                : meeting.status === "recording"
                  ? "Ghost is listening... Refresh to see updates."
                  : "Waiting for transcript data..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
