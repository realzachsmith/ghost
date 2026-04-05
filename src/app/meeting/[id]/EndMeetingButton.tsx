"use client";

import { useState } from "react";

export default function EndMeetingButton({ meetingId }: { meetingId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState("");

  async function handleEnd() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/meeting/${meetingId}/end`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setResult(`Debrief sent! ${data.momentsCount} relevant moments from ${data.transcriptCount} segments.`);
    } catch (err) {
      setStatus("error");
      setResult(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
        <p className="text-green-400 text-sm">{result}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-zinc-400 hover:text-zinc-200 text-xs underline"
        >
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleEnd}
        disabled={status === "loading"}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {status === "loading" ? "Generating debrief..." : "End Meeting & Send Debrief"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm self-center">{result}</p>
      )}
    </div>
  );
}
