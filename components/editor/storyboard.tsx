"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { fetchJson, fetchVoid } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { useMutation } from "@tanstack/react-query";

interface Character {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface Panel {
  number: number;
  description: string;
  characterId: string;
  locationId: string;
}

interface StoryboardProps {
  projectId: string;
  initialPanels: Panel[];
  characters: Character[];
  locations: Location[];
}

export function Storyboard({ projectId, initialPanels, characters, locations }: StoryboardProps) {
  const [panels, setPanels] = useState<Panel[]>(initialPanels);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const projectQuery = useApiQuery<{
    settings?: { linkedEntities?: { characters?: string[]; locations?: string[] } };
  }>(["projects", projectId, "storyboard"], `/api/projects/${projectId}`);
  const linkedCharIds = useMemo(
    () => projectQuery.data?.settings?.linkedEntities?.characters ?? [],
    [projectQuery.data?.settings?.linkedEntities?.characters]
  );
  const linkedLocIds = useMemo(
    () => projectQuery.data?.settings?.linkedEntities?.locations ?? [],
    [projectQuery.data?.settings?.linkedEntities?.locations]
  );
  const linkedChars = useMemo(
    () => characters.filter((character) => linkedCharIds.includes(character.id)),
    [characters, linkedCharIds]
  );
  const linkedLocs = useMemo(
    () => locations.filter((location) => linkedLocIds.includes(location.id)),
    [locations, linkedLocIds]
  );
  const savePanelsMutation = useMutation({
    mutationFn: async (updatedPanels: Panel[]) => {
      await fetchJson(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          settings: { storyboard: { panels: updatedPanels } },
          panelCount: updatedPanels.length,
        }),
      });
      await fetchVoid("/api/gamification/progress", {
        method: "POST",
        body: JSON.stringify({ value: updatedPanels.length, type: "panels" }),
      }).catch(() => undefined);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "storyboard"] });
    },
    onError: () => {
      toast({ title: "Failed to save storyboard", variant: "destructive" });
    },
  });

  const persistPanels = useCallback(
    (updatedPanels: Panel[]) => {
      setPanels(updatedPanels);
      savePanelsMutation.mutate(updatedPanels);
    },
    [savePanelsMutation]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Storyboard Panels</h2>
        <div className="flex items-center gap-2">
          {(linkedChars.length > 0 || linkedLocs.length > 0) && (
            <span className="text-[10px] text-fg/40">
              {linkedChars.length} Linked | {linkedLocs.length} Linked
            </span>
          )}
          <button
            onClick={() =>
              persistPanels([
                ...panels,
                {
                  number: panels.length + 1,
                  description: "",
                  characterId: "",
                  locationId: "",
                },
              ])
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" />
            Add Panel
          </button>
        </div>
      </div>

      {panels.length === 0 ? (
        <div className="py-10 text-center text-fg/40">
          <p className="text-sm">No panels yet. Click &quot;Add Panel&quot; to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {panels.map((panel, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-fg/10 bg-bg p-4">
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm font-bold text-fg/50">#{panel.number}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (index === 0) return;
                      const updated = [...panels];
                      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                      persistPanels(
                        updated.map((entry, order) => ({ ...entry, number: order + 1 }))
                      );
                    }}
                    disabled={index === 0}
                    className="rounded p-1 hover:bg-fg/5 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (index === panels.length - 1) return;
                      const updated = [...panels];
                      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                      persistPanels(
                        updated.map((entry, order) => ({ ...entry, number: order + 1 }))
                      );
                    }}
                    disabled={index === panels.length - 1}
                    className="rounded p-1 hover:bg-fg/5 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex-1" />
                <button
                  onClick={() =>
                    persistPanels(
                      panels
                        .filter((_, currentIndex) => currentIndex !== index)
                        .map((entry, order) => ({ ...entry, number: order + 1 }))
                    )
                  }
                  className="rounded p-1 text-fg/40 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={panel.description}
                onChange={(event) =>
                  setPanels((current) =>
                    current.map((entry, currentIndex) =>
                      currentIndex === index ? { ...entry, description: event.target.value } : entry
                    )
                  )
                }
                onBlur={() => savePanelsMutation.mutate(panels)}
                placeholder="Panel description..."
                className="min-h-[60px] w-full resize-y rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
                rows={2}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-fg/50">Character</label>
                  <select
                    value={panel.characterId}
                    onChange={(event) =>
                      setPanels((current) =>
                        current.map((entry, currentIndex) =>
                          currentIndex === index
                            ? { ...entry, characterId: event.target.value }
                            : entry
                        )
                      )
                    }
                    onBlur={() => savePanelsMutation.mutate(panels)}
                    className="w-full rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-sm"
                  >
                    <option value="">None</option>
                    {linkedChars.length > 0 && (
                      <optgroup label="Linked Characters">
                        {linkedChars.map((character) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {characters
                      .filter((character) => !linkedCharIds.includes(character.id))
                      .map((character) => (
                        <option key={character.id} value={character.id}>
                          {character.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-fg/50">Location</label>
                  <select
                    value={panel.locationId}
                    onChange={(event) =>
                      setPanels((current) =>
                        current.map((entry, currentIndex) =>
                          currentIndex === index
                            ? { ...entry, locationId: event.target.value }
                            : entry
                        )
                      )
                    }
                    onBlur={() => savePanelsMutation.mutate(panels)}
                    className="w-full rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-sm"
                  >
                    <option value="">None</option>
                    {linkedLocs.length > 0 && (
                      <optgroup label="Linked Locations">
                        {linkedLocs.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {locations
                      .filter((location) => !linkedLocIds.includes(location.id))
                      .map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {savePanelsMutation.isPending && <p className="text-right text-xs text-fg/40">Saving...</p>}
    </div>
  );
}
