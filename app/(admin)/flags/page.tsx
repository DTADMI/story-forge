"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/toast";

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
    enabled: false,
    value: false,
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
    enabled: false,
    value: false,
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
];

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FLAGS);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/flags")
      .then((r) => {
        if (r.status === 403) window.location.href = "/signin";
        else setAuthorized(true);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFlags(data);
      })
      .catch(() => {});
  }, []);

  if (!authorized) return <div>Checking access...</div>;

  const toggle = async (id: string) => {
    // Optimistic update: toggle immediately
    const previousFlags = flags;
    const updated = flags.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled, value: !f.enabled } : f
    );
    setFlags(updated);

    setSaving(true);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Saved", description: `Flag "${id}" updated.` });
    } catch {
      // Rollback on failure
      setFlags(previousFlags);
      toast({
        title: "Save failed",
        description: "Could not update feature flags. Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(flags.map((f) => f.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Feature Flags</h1>
        {saving && <span className="text-sm text-fg/40 animate-pulse">Saving...</span>}
      </div>
      {categories.map((cat) => (
        <Card key={cat} className="p-4">
          <h2 className="text-sm font-bold text-fg/50 uppercase tracking-wide mb-3">{cat}</h2>
          <div className="space-y-2">
            {flags
              .filter((f) => f.category === cat)
              .map((f) => (
                <div key={f.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm font-medium">{f.name}</span>
                    <p className="text-xs text-fg/40">{f.description}</p>
                  </div>
                  <button
                    onClick={() => toggle(f.id)}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                      f.enabled ? "bg-brand" : "bg-fg/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        f.enabled ? "translate-x-5" : "translate-x-1"
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
