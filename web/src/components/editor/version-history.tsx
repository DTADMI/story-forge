"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

interface Version {
  id: string;
  wordCount: number;
  label: string | null;
  createdAt: string;
}

export function VersionHistory({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/projects/${projectId}/versions`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setVersions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (!res.ok) throw new Error("Restore failed");
      toast({
        title: "Version restored",
        description: "The project content has been restored. Reload the editor to see changes.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast({
        title: "Restore failed",
        description: "Could not restore this version.",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-fg/5 animate-pulse rounded" />
        ))}
      </div>
    );
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
      {versions.map((v) => (
        <div
          key={v.id}
          className="flex items-center justify-between py-2 px-3 border border-fg/10 rounded-md text-sm"
        >
          <div>
            <span className="font-medium">{v.label || "Untitled version"}</span>
            <span className="text-fg/40 ml-2">{v.wordCount} words</span>
            <span className="text-fg/40 ml-2">{new Date(v.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => handleRestore(v.id)}
            disabled={restoring === v.id}
            className="text-xs text-brand hover:underline disabled:opacity-50"
          >
            {restoring === v.id ? "Restoring..." : "Restore"}
          </button>
        </div>
      ))}
    </div>
  );
}
