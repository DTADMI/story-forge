"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  research: "Research",
  calendar: "Calendar",
  magic: "Magic",
  fauna: "Fauna",
  flora: "Flora",
  culture: "Culture",
  item: "Items",
  system: "Systems",
  language: "Language",
  religion: "Religion",
  philosophy: "Philosophy",
};

export default function NewEncyclopediaEntryPage() {
  const params = useParams();
  const category = params?.category as string;
  const label = categoryLabels[category] || category;
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/world/encyclopedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: title.trim(),
          content: content.trim(),
          projectId: projectId || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create entry");
      }
      toast({ title: "Entry created!" });
      router.push(`/world/encyclopedia/${category}`);
      router.refresh();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to create entry",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/world/encyclopedia/${category}`} className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">New {label} Entry</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
              placeholder="Entry title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
              placeholder="Write your entry content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project (optional)</label>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
              placeholder="Associate with a project"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Entry"}
          </button>
        </form>
      </Card>
    </main>
  );
}
