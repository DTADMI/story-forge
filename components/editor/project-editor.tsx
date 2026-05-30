"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiWritingButton } from "@/components/ai/ai-writing";
import { Editor } from "@/components/editor/editor";
import { ExportDropdown } from "@/components/editor/export-dropdown";
import { useToast } from "@/components/toast";
import { fetchJson, fetchVoid } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { useYjsCollaboration } from "@/lib/yjs-collaboration";
import { isEnabledSync } from "@/lib/flags";

interface ProjectEditorProps {
  project: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    defaultScope: string;
    wordCount?: number;
    panelCount?: number;
    settings?: {
      linkedEntities?: {
        characters?: string[];
        locations?: string[];
      };
    };
  };
  userPreferences?: {
    breakReminders?: boolean;
  };
  currentUser?: { id: string; name: string };
}

export function ProjectEditor({ project, userPreferences, currentUser }: ProjectEditorProps) {
  const projectsV2Enabled = isEnabledSync("projects_v2");
  const wellbeingEnabled = isEnabledSync("wellbeing");

  const [content, setContent] = useState(project.content || "");
  const [lastBreak, setLastBreak] = useState(() => Date.now());
  const [showLinkedEntities, setShowLinkedEntities] = useState(false);
  const collaboration = useYjsCollaboration(project.id, currentUser ?? { id: "", name: "" });
  const [linkedCharIds, setLinkedCharIds] = useState<string[]>(
    project.settings?.linkedEntities?.characters || []
  );
  const [linkedLocIds, setLinkedLocIds] = useState<string[]>(
    project.settings?.linkedEntities?.locations || []
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const charactersQuery = useApiQuery<{ id: string; name: string }[]>(
    ["world", "characters", project.id],
    `/api/world/characters?projectId=${project.id}`,
    {
      enabled: showLinkedEntities,
    }
  );
  const locationsQuery = useApiQuery<{ id: string; name: string }[]>(
    ["world", "locations", project.id],
    `/api/world/locations?projectId=${project.id}`,
    {
      enabled: showLinkedEntities,
    }
  );
  const goalsQuery = useApiQuery<{ type: string; target: number; currentProgress?: number }[]>(
    ["gamification", "goals"],
    "/api/gamification/goals"
  );
  const activeGoal = useMemo(() => {
    const goals = goalsQuery.data ?? [];
    const wordsGoal = goals.find((goal) => goal.type === "words_per_day");
    return wordsGoal
      ? {
          type: wordsGoal.type,
          target: wordsGoal.target,
          currentProgress: wordsGoal.currentProgress ?? 0,
        }
      : null;
  }, [goalsQuery.data]);
  const saveProjectMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      fetchJson(`/api/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onError: () => {
      toast({ title: "Failed to save project", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!wellbeingEnabled || !userPreferences?.breakReminders) return;
    const interval = window.setInterval(() => {
      const minutesSinceBreak = (Date.now() - lastBreak) / 1000 / 60;
      if (minutesSinceBreak >= 45) {
        if (confirm("You have been writing for 45 minutes. Take a short break to stay fresh!")) {
          setLastBreak(Date.now());
        } else {
          setLastBreak(Date.now() - 30 * 60 * 1000);
        }
      }
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [lastBreak, userPreferences?.breakReminders, wellbeingEnabled]);

  const liveWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lastParagraph = content.split(/\n\n+/).pop() ?? content.slice(-500);

  const updateLinkedEntities = useCallback(
    async (characters: string[], locations: string[]) => {
      setLinkedCharIds(characters);
      setLinkedLocIds(locations);
      await saveProjectMutation.mutateAsync({
        settings: {
          ...project.settings,
          linkedEntities: { characters, locations },
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["projects", project.id, "storyboard"] });
    },
    [project.id, project.settings, queryClient, saveProjectMutation]
  );

  if (!projectsV2Enabled) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Projects V2 coming soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold">{project.title}</h1>
          <AiWritingButton
            context={lastParagraph}
            onSuggestion={(suggestion) => setContent((current) => `${current}\n\n${suggestion}`)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowLinkedEntities((current) => !current)}
            className="rounded-md border border-fg/20 px-3 py-1.5 text-xs hover:bg-fg/5"
          >
            {showLinkedEntities ? "Hide Linked Entities" : "Linked Entities"}
          </button>
          <ExportDropdown projectId={project.id} />
          <span className="text-xs font-mono text-fg/40">
            {liveWordCount.toLocaleString()} words
            {project.panelCount && project.panelCount > 0 ? ` · ${project.panelCount} panels` : ""}
          </span>
          {activeGoal && (
            <span
              className={`text-xs font-mono ${activeGoal.currentProgress >= activeGoal.target ? "text-green-500" : "text-fg/50"}`}
              title={`${activeGoal.currentProgress} / ${activeGoal.target} words today`}
            >
              {activeGoal.currentProgress >= activeGoal.target ? "✓ " : ""}
              {activeGoal.currentProgress.toLocaleString()} / {activeGoal.target.toLocaleString()}{" "}
              today
            </span>
          )}
          {saveProjectMutation.isPending && (
            <span className="animate-pulse text-sm text-fg/50">Saving...</span>
          )}
          {isEnabledSync("real_time_collaboration") && collaboration.synced && (
            <span className="text-xs text-green-500 font-mono">● Synced</span>
          )}
          {isEnabledSync("real_time_collaboration") && !collaboration.synced && currentUser && (
            <span className="text-xs text-yellow-500 font-mono animate-pulse">● Connecting...</span>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Editor
            content={content}
            onChange={setContent}
            collaborationExtensions={collaboration.extensions}
            editable={isEnabledSync("real_time_collaboration") ? collaboration.synced : true}
            onSave={async (newContent) => {
              setContent(newContent);
              await saveProjectMutation.mutateAsync({ content: newContent });
              await fetchVoid("/api/gamification/progress", {
                method: "POST",
                body: JSON.stringify({
                  value: newContent.trim().split(/\s+/).length,
                  type: "words",
                }),
              }).catch(() => undefined);
            }}
          />
        </div>

        {showLinkedEntities && (
          <div className="w-56 shrink-0 space-y-4 border-l border-fg/10 pl-4">
            <div>
              <h3 className="mb-2 text-sm font-bold">Characters</h3>
              {(charactersQuery.data ?? []).length === 0 ? (
                <p className="text-xs text-fg/40">No characters in project</p>
              ) : (
                <div className="space-y-1">
                  {(charactersQuery.data ?? []).map((character) => (
                    <label
                      key={character.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-fg/5"
                    >
                      <input
                        type="checkbox"
                        checked={linkedCharIds.includes(character.id)}
                        onChange={() =>
                          void updateLinkedEntities(
                            linkedCharIds.includes(character.id)
                              ? linkedCharIds.filter((id) => id !== character.id)
                              : [...linkedCharIds, character.id],
                            linkedLocIds
                          )
                        }
                        className="rounded"
                      />
                      {character.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold">Locations</h3>
              {(locationsQuery.data ?? []).length === 0 ? (
                <p className="text-xs text-fg/40">No locations in project</p>
              ) : (
                <div className="space-y-1">
                  {(locationsQuery.data ?? []).map((location) => (
                    <label
                      key={location.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-fg/5"
                    >
                      <input
                        type="checkbox"
                        checked={linkedLocIds.includes(location.id)}
                        onChange={() =>
                          void updateLinkedEntities(
                            linkedCharIds,
                            linkedLocIds.includes(location.id)
                              ? linkedLocIds.filter((id) => id !== location.id)
                              : [...linkedLocIds, location.id]
                          )
                        }
                        className="rounded"
                      />
                      {location.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-fg/40">
              Linked entities are saved to project settings. Use them to associate scene context
              with world data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
