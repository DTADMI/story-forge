"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

interface ReligionBuilderProps {
  onSaved?: () => void;
}

export function ReligionBuilder({ onSaved }: ReligionBuilderProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [deities, setDeities] = useState<string[]>([]);
  const [newDeity, setNewDeity] = useState("");
  const [tenets, setTenets] = useState("");
  const [rituals, setRituals] = useState("");
  const [holyTexts, setHolyTexts] = useState("");
  const [hierarchy, setHierarchy] = useState("");
  const createReligionMutation = useApiMutation<unknown, Record<string, unknown>>(
    "/api/world/encyclopedia",
    {
      onSuccess: () => {
        toast({ title: "Religion created." });
        onSaved?.();
      },
      onError: (error) => {
        toast({
          title: "Failed to save religion",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );

  function addDeity() {
    if (!newDeity.trim()) return;
    setDeities((current) => [...current, newDeity.trim()]);
    setNewDeity("");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Religion Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. The Church of Light"
          className="w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Deities</label>
        <div className="mb-2 flex items-center gap-2">
          <input
            value={newDeity}
            onChange={(event) => setNewDeity(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addDeity())}
            placeholder="Add a deity..."
            className="flex-1 rounded-md border border-fg/20 bg-bg px-3 py-1.5 text-sm"
          />
          <button
            onClick={addDeity}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand/90"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        {deities.length > 0 && (
          <ul className="space-y-1">
            {deities.map((deity, index) => (
              <li
                key={`${deity}-${index}`}
                className="flex items-center justify-between rounded px-2 py-1 text-xs hover:bg-fg/5"
              >
                <span>{deity}</span>
                <button
                  onClick={() => setDeities((current) => current.filter((_, i) => i !== index))}
                  className="text-fg/30 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tenets</label>
        <textarea
          value={tenets}
          onChange={(event) => setTenets(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Core beliefs and tenets..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Rituals</label>
        <textarea
          value={rituals}
          onChange={(event) => setRituals(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Religious rituals and practices..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Holy Texts</label>
        <textarea
          value={holyTexts}
          onChange={(event) => setHolyTexts(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Sacred texts and scriptures..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Hierarchy</label>
        <textarea
          value={hierarchy}
          onChange={(event) => setHierarchy(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          placeholder="Organizational structure and ranks..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={async () => {
            if (!name.trim()) {
              toast({ title: "Name is required", variant: "destructive" });
              return;
            }

            await createReligionMutation.mutateAsync({
              category: "religion",
              title: name.trim(),
              content: `**Deities:** ${deities.join(", ") || "None"}\n**Tenets:** ${tenets || "N/A"}\n**Rituals:** ${rituals || "N/A"}\n**Holy Texts:** ${holyTexts || "N/A"}\n**Hierarchy:** ${hierarchy || "N/A"}`,
              metadata: {
                deities,
                tenets: tenets.trim(),
                rituals: rituals.trim(),
                holyTexts: holyTexts.trim(),
                hierarchy: hierarchy.trim(),
              },
            });
          }}
          disabled={createReligionMutation.isPending}
          className="rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {createReligionMutation.isPending ? "Saving..." : "Create Religion"}
        </button>
      </div>
    </div>
  );
}
