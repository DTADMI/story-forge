"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { Card } from "@/components/ui/card";
import { useApiMutation } from "@/lib/query-hooks";
import { getErrorMessage } from "@/lib/client-api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSpeciesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [appearance, setAppearance] = useState("");
  const [traits, setTraits] = useState("");
  const [lifespan, setLifespan] = useState("");
  const [homeland, setHomeland] = useState("");
  const [projectId, setProjectId] = useState("");

  const createSpecies = useApiMutation<unknown, Record<string, unknown>>("/api/world/species", {
    onSuccess: () => {
      toast({ title: "Species created!" });
      router.push("/world/species");
      router.refresh();
    },
    onError: (err) => {
      toast({ title: getErrorMessage(err, "Failed to create species"), variant: "destructive" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    createSpecies.mutate({
      name: name.trim(),
      description: description.trim() || null,
      appearance: appearance.trim() || null,
      traits: traits.trim() || null,
      lifespan: lifespan.trim() || null,
      homeland: homeland.trim() || null,
      projectId: projectId.trim() || null,
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/species" className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">New Species</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
              placeholder="Species or race name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
              placeholder="Describe this species..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Appearance</label>
            <textarea
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
              placeholder="Physical characteristics"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Traits</label>
              <input
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
                placeholder="e.g. Agile, Long-lived"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lifespan</label>
              <input
                value={lifespan}
                onChange={(e) => setLifespan(e.target.value)}
                className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
                placeholder="e.g. 200 years"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Homeland</label>
            <input
              value={homeland}
              onChange={(e) => setHomeland(e.target.value)}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
              placeholder="e.g. The Northern Reaches"
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

          <div className="flex justify-end gap-3 mt-4">
            <Link
              href="/world/species"
              className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createSpecies.isPending}
              className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
            >
              {createSpecies.isPending ? "Creating..." : "Create Species"}
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}
