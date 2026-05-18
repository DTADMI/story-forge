"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

interface PrivateNotesProps {
  entityType: string;
  entityId: string;
  initialNotes: string;
}

export function PrivateNotes({ entityType, entityId, initialNotes }: PrivateNotesProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/world/${entityType}/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { privateNotes: notes } }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Notes saved" });
    } catch {
      toast({ title: "Failed to save notes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-dashed border-fg/20 rounded-lg p-4 bg-fg/[0.02]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-fg/50 hover:text-fg"
      >
        <span>GM Notes / Private Notes</span>
        <span className="text-xs">{expanded ? "-" : "+"}</span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-fg/40">
            These notes are stored privately and only visible to you.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-dashed border-fg/20 bg-fg/[0.03] px-3 py-2 text-sm resize-y"
            placeholder="Write private notes here..."
          />
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 text-xs bg-fg/10 text-fg rounded-md hover:bg-fg/20 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
