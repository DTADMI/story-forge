"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/skeleton";

interface Era {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  sortOrder: number;
  project?: { id: string; title: string } | null;
}

export default function EraDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [era, setEra] = useState<Era | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/world/era/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        setEra(await res.json());
      } catch {
        setError("Era not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleUpdate(field: string, value: string) {
    if (!era) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/world/era/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEra({ ...era, [field]: value });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this era? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/world/era/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/world/era");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    );
  }

  if (error && !era) return <p className="text-destructive">{error}</p>;
  if (!era) return null;

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{era.name}</h1>
          <p className="text-muted-foreground">Edit era details.</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 py-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            defaultValue={era.name}
            onBlur={(e) => handleUpdate("name", e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            defaultValue={era.description || ""}
            onBlur={(e) => handleUpdate("description", e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              defaultValue={era.startDate || ""}
              onBlur={(e) => handleUpdate("startDate", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              defaultValue={era.endDate || ""}
              onBlur={(e) => handleUpdate("endDate", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            defaultValue={era.color || "#6366f1"}
            onBlur={(e) => handleUpdate("color", e.target.value)}
            className="h-9 w-16 cursor-pointer"
          />
        </div>

        {era.project && (
          <p className="text-xs text-muted-foreground">Project: {era.project.title}</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saving && <p className="text-xs text-muted-foreground">Saving...</p>}
      </Card>
    </div>
  );
}
