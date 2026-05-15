"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { Card } from "@/components/ui/card";

export function SpeciesEditForm({ species }: { species: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(species.name || "");
  const [description, setDescription] = useState(species.description || "");
  const [appearance, setAppearance] = useState(species.appearance || "");
  const [traits, setTraits] = useState(species.traits || "");
  const [lifespan, setLifespan] = useState(species.lifespan || "");
  const [homeland, setHomeland] = useState(species.homeland || "");
  const [projectId, setProjectId] = useState(species.projectId || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/world/species/${species.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          appearance: appearance.trim() || null,
          traits: traits.trim() || null,
          lifespan: lifespan.trim() || null,
          homeland: homeland.trim() || null,
          projectId: projectId.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: "Species updated!" });
      router.refresh();
    } catch {
      toast({ title: "Failed to update species", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">Edit Species</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Appearance</label>
          <textarea
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Traits</label>
            <input
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lifespan</label>
            <input
              value={lifespan}
              onChange={(e) => setLifespan(e.target.value)}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Homeland</label>
          <input
            value={homeland}
            onChange={(e) => setHomeland(e.target.value)}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Project (optional)</label>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </Card>
  );
}
