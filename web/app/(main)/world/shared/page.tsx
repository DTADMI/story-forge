"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { ArrowLeft, Share2, Loader2 } from "lucide-react";
import Link from "next/link";

interface SharedEntity {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  projectId?: string;
  sharedFromProjectId?: string;
  type?: string;
}

const ENTITY_TYPES = [
  { key: "characters", label: "Characters" },
  { key: "locations", label: "Locations" },
  { key: "timelineEvents", label: "Timeline Events" },
  { key: "organizations", label: "Organizations" },
  { key: "species", label: "Species" },
];

export default function SharedWorldPage() {
  const [entities, setEntities] = useState<Record<string, SharedEntity[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("characters");
  const [importing, setImporting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchShared();
  }, []);

  const fetchShared = async () => {
    try {
      const res = await fetch("/api/world/shared");
      if (res.ok) {
        const data = await res.json();
        setEntities(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (entityType: string, entityId: string, entityName: string) => {
    setImporting(entityId);
    try {
      const targetProjectId = prompt(`Enter the project ID to import "${entityName}" into:`);
      if (!targetProjectId) {
        setImporting(null);
        return;
      }

      const res = await fetch("/api/world/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, targetProjectId }),
      });

      if (res.ok) {
        toast({ title: `"${entityName}" imported successfully` });
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to import", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to import entity", variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  const currentEntities = entities[activeTab] || [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/world" className="p-1 rounded hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">Shared World Entities</h1>
      </div>

      <p className="text-sm text-fg/60">
        Browse entities shared across projects by other writers. Import them into your own projects.
      </p>

      <div className="flex gap-2 border-b border-fg/10 pb-2 overflow-x-auto">
        {ENTITY_TYPES.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm rounded-md shrink-0 ${
              activeTab === tab.key ? "bg-brand text-white" : "hover:bg-fg/5 text-fg/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-fg/40">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading shared entities...
        </div>
      ) : currentEntities.length === 0 ? (
        <div className="text-center py-12 text-fg/40">
          <p className="text-sm">No shared {activeTab} available yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {currentEntities.map((entity) => (
            <div
              key={entity.id}
              className="flex items-start justify-between gap-3 p-3 border border-fg/10 rounded-lg bg-bg"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {entity.name || entity.title || "Untitled"}
                </p>
                {(entity.description || entity.type) && (
                  <p className="text-xs text-fg/40 truncate mt-0.5">
                    {entity.description || entity.type || ""}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  handleImport(
                    activeTab === "timelineEvents" ? "timelineEvent" : activeTab.replace(/s$/, ""),
                    entity.id,
                    entity.name || entity.title || "Untitled"
                  )
                }
                disabled={importing === entity.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-brand text-white rounded-md hover:bg-brand/90 disabled:opacity-50 shrink-0"
              >
                {importing === entity.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                Import
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
