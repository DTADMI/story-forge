"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/toast";
import { fetchJson, getErrorMessage } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { useOptimisticMutation } from "@/lib/mutation";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  value: boolean | number | string[];
  category: string;
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    id: "payments",
    name: "Payments",
    description: "Stripe subscription checkout",
    type: "boolean",
    enabled: false,
    value: false,
    category: "monetization",
  },
  {
    id: "ai_assist",
    name: "AI Writing Assistant",
    description: "Master AI toggle",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_writing_suggestions",
    name: "AI Writing Suggestions",
    description: "Inline AI suggestions in editor",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_character_development",
    name: "AI Character Dev",
    description: "AI-generated character traits",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_plot_analysis",
    name: "AI Plot Analysis",
    description: "AI story structure review",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_style_consistency",
    name: "AI Style Check",
    description: "AI writing style analysis",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_research_assistant",
    name: "AI Research",
    description: "AI research assistant",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "projects_v2",
    name: "Projects V2",
    description: "Next-gen project editor",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "wellbeing",
    name: "Wellbeing",
    description: "Break reminders, streak recovery",
    type: "boolean",
    enabled: true,
    value: true,
    category: "wellbeing",
  },
  {
    id: "design_system_v2",
    name: "Design System V2",
    description: "Updated tokens + components",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "real_time_collaboration",
    name: "Real-time Collab",
    description: "Live co-authoring",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "groups_feature",
    name: "Groups",
    description: "Writing groups",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "public_feed",
    name: "Public Feed",
    description: "Story discovery feed",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "activity_feed",
    name: "Activity Feed",
    description: "Friends' writing activity feed",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "writing_stats",
    name: "Writing Statistics",
    description: "Personal writing statistics dashboard",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "comments",
    name: "Comments",
    description: "Project comments and discussions",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "export",
    name: "Project Export",
    description: "Export projects as Markdown, EPUB, PDF",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "oauth",
    name: "OAuth Providers",
    description: "Sign in with Google and GitHub",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "version_history",
    name: "Version History",
    description: "Save and restore previous project versions",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "search",
    name: "Search",
    description: "Full-text search across projects and world entities",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
];

export default function AdminFlagsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ["admin", "flags"];
  const flagsQuery = useApiQuery<FeatureFlag[]>(queryKey, "/api/admin/flags", {
    retry: false,
  });
  const flags = flagsQuery.data && flagsQuery.data.length > 0 ? flagsQuery.data : DEFAULT_FLAGS;
  const updateFlagsMutation = useOptimisticMutation<FeatureFlag[], FeatureFlag[], FeatureFlag[]>({
    mutationFn: (updatedFlags) =>
      fetchJson<FeatureFlag[]>("/api/admin/flags", {
        method: "PUT",
        body: JSON.stringify(updatedFlags),
      }),
    queryKey,
    updater: (_current, updatedFlags) => updatedFlags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: getErrorMessage(error, "Could not update feature flags. Try again."),
        variant: "destructive",
      });
    },
  });
  const categories = useMemo(() => [...new Set(flags.map((flag) => flag.category))], [flags]);

  if (flagsQuery.isLoading) {
    return <div>Checking access...</div>;
  }

  if (flagsQuery.isError) {
    return <div>{getErrorMessage(flagsQuery.error)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Feature Flags</h1>
        {updateFlagsMutation.isPending && (
          <span className="animate-pulse text-sm text-fg/40">Saving...</span>
        )}
      </div>

      {categories.map((category) => (
        <Card key={category} className="p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-fg/50">{category}</h2>
          <div className="space-y-2">
            {flags
              .filter((flag) => flag.category === category)
              .map((flag) => (
                <div key={flag.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm font-medium">{flag.name}</span>
                    <p className="text-xs text-fg/40">{flag.description}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const updatedFlags = flags.map((entry) =>
                        entry.id === flag.id
                          ? { ...entry, enabled: !entry.enabled, value: !entry.enabled }
                          : entry
                      );
                      await updateFlagsMutation.mutateAsync(updatedFlags);
                      toast({ title: "Saved", description: `Flag "${flag.id}" updated.` });
                    }}
                    disabled={updateFlagsMutation.isPending}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                      flag.enabled ? "bg-brand" : "bg-fg/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        flag.enabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
