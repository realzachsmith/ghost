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
      setResult(`Debrief sent. ${data.momentsCount} relevant moments from ${data.transcriptCount} segments.`);
    } catch (err) {
      setStatus("error");
      setResult(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "done") {
    return (
      <div
        className="rounded-md px-4 py-3.5 text-center"
        style={{
          background: "rgba(90, 154, 106, 0.06)",
          border: "1px solid rgba(90, 154, 106, 0.12)",
        }}
      >
        <p className="text-sm" style={{ color: "#5a9a6a" }}>{result}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs transition-colors"
          style={{ color: "#8a7e72" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#b0a090")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a7e72")}
        >
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleEnd}
        disabled={status === "loading"}
        className="text-sm font-medium px-5 py-2 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: status === "loading" ? "#2a2520" : "#c8a26a",
          color: status === "loading" ? "#8a7e72" : "#0c0a09",
        }}
        onMouseEnter={(e) => {
          if (status !== "loading") e.currentTarget.style.background = "#d4b07a";
        }}
        onMouseLeave={(e) => {
          if (status !== "loading") e.currentTarget.style.background = "#c8a26a";
        }}
      >
        {status === "loading" ? "Generating debrief..." : "End Meeting & Send Debrief"}
      </button>
      {status === "error" && (
        <p className="text-sm" style={{ color: "#c87060" }}>{result}</p>
      )}
    </div>
  );
}
