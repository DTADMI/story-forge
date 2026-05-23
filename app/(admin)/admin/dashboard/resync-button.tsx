"use client";

import { useApiMutation } from "@/lib/query-hooks";
import type { ApiError } from "@/lib/client-api";

export function ResyncGraphButton() {
  const resync = useApiMutation<{ nodeCount: number; relationshipCount: number }, void>(
    "/api/admin/neo4j/resync"
  );

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={() => resync.mutate(undefined)}
        disabled={resync.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {resync.isPending ? "Resyncing..." : "Resync Graph Database"}
      </button>
      {resync.isSuccess && resync.data && (
        <p className="text-xs text-green-600">
          Graph resynced: {resync.data.nodeCount} nodes, {resync.data.relationshipCount}{" "}
          relationships
        </p>
      )}
      {resync.isError && (
        <p className="text-xs text-red-500">
          {((resync.error as ApiError)?.payload as { error?: string; detail?: string })?.error ??
            ((resync.error as ApiError)?.payload as { error?: string; detail?: string })?.detail ??
            "Resync failed"}
        </p>
      )}
    </div>
  );
}
