"use client";

import { useState } from "react";
import { EntitySelector } from "@/components/world/entity-selector";
import Link from "next/link";

export function TimelineEditForm({
  event,
  existingCharacterIds,
  existingLocationIds,
  action,
  deleteAction,
}: {
  event: any;
  existingCharacterIds: string[];
  existingLocationIds: string[];
  action: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [characterIds, setCharacterIds] = useState<string[]>(existingCharacterIds);
  const [locationIds, setLocationIds] = useState<string[]>(existingLocationIds);

  function handleSubmit() {
    const charInput = document.getElementById("edit-hidden-char-ids") as HTMLInputElement;
    const locInput = document.getElementById("edit-hidden-loc-ids") as HTMLInputElement;
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
          defaultValue={event.title}
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Date (flexible format)</label>
        <input
          name="date"
          defaultValue={event.date ?? ""}
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={event.description ?? ""}
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      {/* Entity Selectors */}
      <div className="border border-fg/10 rounded-lg p-4 space-y-4">
        <EntitySelector entityType="character" selected={characterIds} onChange={setCharacterIds} />
        <EntitySelector entityType="location" selected={locationIds} onChange={setLocationIds} />
      </div>

      <div>
        <label className="block text-sm font-medium">Project (optional)</label>
        <input
          name="projectId"
          defaultValue={event.projectId ?? ""}
          className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
        />
      </div>

      <input type="hidden" name="characterIds" id="edit-hidden-char-ids" />
      <input type="hidden" name="locationIds" id="edit-hidden-loc-ids" />

      <div className="flex justify-between gap-3 mt-4">
        <form action={deleteAction}>
          <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
            Delete Event
          </button>
        </form>
        <div className="flex gap-3">
          <Link
            href="/world/timeline"
            className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
          >
            Cancel
          </Link>
          <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
}
