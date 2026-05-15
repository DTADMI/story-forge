"use client";

import { useState } from "react";
import { EntitySelector } from "@/components/world/entity-selector";
import Link from "next/link";

export function TimelineForm({ action }: { action: (formData: FormData) => void }) {
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);

  function handleSubmit(_e: React.FormEvent<HTMLFormElement>) {
    // Populate hidden inputs before submit
    const charInput = document.getElementById("hidden-char-ids") as HTMLInputElement;
    const locInput = document.getElementById("hidden-loc-ids") as HTMLInputElement;
    if (charInput) charInput.value = characterIds.join(",");
    if (locInput) locInput.value = locationIds.join(",");
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          placeholder="e.g. The Inciting Incident"
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Date (flexible format)</label>
        <input
          name="date"
          placeholder="e.g. Chapter 3, 1920s, Day 47"
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={4}
          placeholder="What happens at this point in the story..."
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      {/* Entity Selectors */}
      <div className="border border-fg/10 rounded-lg p-4 space-y-4">
        <EntitySelector
          entityType="character"
          selected={characterIds}
          onChange={setCharacterIds}
        />
        <EntitySelector
          entityType="location"
          selected={locationIds}
          onChange={setLocationIds}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Project (optional)</label>
        <input
          name="projectId"
          placeholder="Project ID"
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      {/* Hidden inputs for entity IDs */}
      <input type="hidden" name="characterIds" id="hidden-char-ids" />
      <input type="hidden" name="locationIds" id="hidden-loc-ids" />

      <div className="flex justify-end gap-3 mt-4">
        <Link
          href="/world/timeline"
          className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
        >
          Cancel
        </Link>
        <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium">
          Create Event
        </button>
      </div>
    </form>
  );
}
