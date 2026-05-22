"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
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
  const [entity, setEntity] = useState<ModEntity | null>(null);
  const [entityType, setEntityType] = useState<"project" | "character">("project");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEntity(data);
          setEntityType("project");
        } else {
          const charRes = await fetch(`/api/world/characters/${params.id}`);
          if (charRes.ok) {
            const data = await charRes.json();
            setEntity(data);
            setEntityType("character");
          }
        }
      } catch {
        // not found
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleAction = async (action: string) => {
    const reason = action === "warn" ? prompt("Reason for warning:") : "";
    setActionLoading(action);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/moderation/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entityType, reason: reason || undefined }),
      });

      if (!res.ok) throw new Error("Action failed");

      const data = await res.json();
      setMessage(data.message || "Action completed");

      if (action === "delete") {
        setTimeout(() => router.push("/admin/moderation"), 1500);
      }
    } catch (err: any) {
      setMessage(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6 text-fg/40">Loading...</div>;
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
            disabled={!!actionLoading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === "approve" ? "..." : "Approve"}
          </button>
          <button
            onClick={() => handleAction("flag")}
            disabled={!!actionLoading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {actionLoading === "flag" ? "..." : "Flag"}
          </button>
          <button
            onClick={() => handleAction("warn")}
            disabled={!!actionLoading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading === "warn" ? "..." : "Warn Author"}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete this ${entityType}? This cannot be undone.`)) {
                handleAction("delete");
              }
            }}
            disabled={!!actionLoading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading === "delete" ? "..." : "Delete"}
          </button>
        </div>
        {message && <p className="text-sm text-fg/60 mt-3">{message}</p>}
      </Card>
    </div>
  );
}
