"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useApiQuery, useApiMutation } from "@/lib/query-hooks";
import { getErrorMessage } from "@/lib/client-api";
import Link from "next/link";

interface ModEntity {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  traits?: string;
  quirks?: string;
  bio?: string;
  createdAt: string;
  user?: { id: string; name?: string; username?: string } | null;
}

export default function ModerationReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("");

  const projectQuery = useApiQuery<ModEntity>(
    ["moderation", "project", params.id],
    `/api/projects/${params.id}`,
    { retry: false }
  );

  const charQuery = useApiQuery<ModEntity>(
    ["moderation", "character", params.id],
    `/api/world/characters/${params.id}`,
    { retry: false, enabled: !!projectQuery.isError }
  );

  const moderatedAction = useApiMutation<
    { message?: string },
    { action: string; entityType: "project" | "character"; reason?: string }
  >(`/api/admin/moderation/${params.id}`, {
    onSuccess: (data, variables) => {
      setMessage(data.message || "Action completed");
      if (
        variables &&
        typeof variables === "object" &&
        "action" in variables &&
        variables.action === "delete"
      ) {
        setTimeout(() => router.push("/admin/moderation"), 1500);
      }
    },
    onError: (err) => {
      setMessage(getErrorMessage(err, "Action failed"));
    },
  });

  const entity = projectQuery.data ?? charQuery.data;
  const entityType: "project" | "character" = projectQuery.data ? "project" : "character";
  const isLoading = projectQuery.isLoading || (projectQuery.isError && charQuery.isLoading);

  const handleAction = (action: string) => {
    const reason = action === "warn" ? prompt("Reason for warning:") : "";
    setMessage("");
    moderatedAction.mutate({ action, entityType, reason: reason || undefined });
  };

  if (isLoading) return <div className="p-6 text-fg/40">Loading...</div>;
  if (!entity) return <div className="p-6 text-fg/40">Entity not found</div>;

  const isProject = entityType === "project";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/moderation" className="text-sm text-fg/40 hover:text-brand">
          ← Moderation
        </Link>
        <h1 className="text-2xl font-extrabold">
          Review: {isProject ? entity.title : entity.name}
        </h1>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-fg/40">Type</span>
            <p className="font-medium">{isProject ? "Project" : "Character"}</p>
          </div>
          <div>
            <span className="text-xs text-fg/40">Author</span>
            <p className="font-medium">
              {entity.user ? (
                <Link href={`/admin/users/${entity.user.id}`} className="hover:text-brand">
                  {entity.user.username || entity.user.name || "—"}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <span className="text-xs text-fg/40">Created</span>
            <p className="font-medium">{new Date(entity.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {isProject && (
          <>
            <div>
              <span className="text-xs text-fg/40">Description</span>
              <p className="text-sm mt-1">{entity.description || "No description"}</p>
            </div>
            <div>
              <span className="text-xs text-fg/40">Content</span>
              <div className="mt-2 p-3 bg-fg/3 rounded text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
                {(entity.content || "").slice(0, 5000) || "No content"}
              </div>
            </div>
          </>
        )}

        {!isProject && (
          <div className="space-y-3">
            <div>
              <span className="text-xs text-fg/40">Traits</span>
              <p className="text-sm">{entity.traits || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-fg/40">Quirks</span>
              <p className="text-sm">{entity.quirks || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-fg/40">Bio</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{entity.bio || "—"}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-bold mb-3">Moderation Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAction("approve")}
            disabled={moderatedAction.isPending}
            className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {moderatedAction.isPending ? "..." : "Approve"}
          </button>
          <button
            onClick={() => handleAction("flag")}
            disabled={moderatedAction.isPending}
            className="px-4 py-2 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {moderatedAction.isPending ? "..." : "Flag"}
          </button>
          <button
            onClick={() => handleAction("warn")}
            disabled={moderatedAction.isPending}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {moderatedAction.isPending ? "..." : "Warn Author"}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete this ${entityType}? This cannot be undone.`)) {
                handleAction("delete");
              }
            }}
            disabled={moderatedAction.isPending}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {moderatedAction.isPending ? "..." : "Delete"}
          </button>
        </div>
        {message && <p className="text-sm text-fg/60 mt-3">{message}</p>}
      </Card>
    </div>
  );
}
