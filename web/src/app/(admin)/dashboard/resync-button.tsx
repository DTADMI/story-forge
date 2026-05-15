"use client";

import { useState } from "react";

export function ResyncGraphButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleResync() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/neo4j/resync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || data.detail || "Resync failed");
      } else {
        setStatus("success");
        setMessage(
          `Graph resynced: ${data.nodeCount} nodes, ${data.relationshipCount} relationships`
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network error during resync");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleResync}
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Resyncing..." : "Resync Graph Database"}
      </button>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
