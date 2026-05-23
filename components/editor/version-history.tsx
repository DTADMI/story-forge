"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation, useApiQuery } from "@/lib/query-hooks";
import { useToast } from "@/components/toast";

interface Version {
  id: string;
  wordCount: number;
  label: string | null;
  createdAt: string;
}

export function VersionHistory({ projectId }: { projectId: string }) {
  const [restoring, setRestoring] = useState<string | null>(null);
  const { toast } = useToast();
  const versionsQuery = useApiQuery<Version[]>(
    ["projects", projectId, "versions"],
    `/api/projects/${projectId}/versions`
  );
  const versions = versionsQuery.data ?? [];
  const restoreMutation = useApiMutation<Version, { versionId: string }>(
    `/api/projects/${projectId}/versions`,
    {
      onSuccess: () => {
        toast({
          title: "Version restored",
          description: "The project content has been restored. Reloading the editor.",
        });
        window.setTimeout(() => window.location.reload(), 1200);
      },
      onError: (error) => {
        toast({
          title: "Restore failed",
          description: getErrorMessage(error, "Could not restore this version."),
          variant: "destructive",
        });
      },
    }
  );

  if (versionsQuery.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded bg-fg/5" />
        ))}
      </div>
    );
  }

  if (versionsQuery.isError) {
    return <p className="text-sm text-fg/40">{getErrorMessage(versionsQuery.error)}</p>;
  }

  if (versions.length === 0) {
    return (
      <p className="text-sm text-fg/40">
        No saved versions yet. Versions are auto-saved when you open this page.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <div
          key={version.id}
          className="flex items-center justify-between rounded-md border border-fg/10 px-3 py-2 text-sm"
        >
          <div>
            <span className="font-medium">{version.label || "Untitled version"}</span>
            <span className="ml-2 text-fg/40">{version.wordCount} words</span>
            <span className="ml-2 text-fg/40">
              {new Date(version.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={async () => {
              setRestoring(version.id);
              try {
                await restoreMutation.mutateAsync({ versionId: version.id });
              } finally {
                setRestoring(null);
              }
            }}
            disabled={restoring === version.id}
            className="text-xs text-brand hover:underline disabled:opacity-50"
          >
            {restoring === version.id ? "Restoring..." : "Restore"}
          </button>
        </div>
      ))}
    </div>
  );
}
