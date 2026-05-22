/**
 * Feature flags for StoryForge — client-safe.
 * Persistence: Redis key `storyforge:feature_flags` + DB table `public.feature_flags`
 * For server-side Prisma-backed loading, use `lib/flags-server.ts`.
 */
import { getRedis } from "./redis";

export type FlagType = "boolean" | "percentage" | "user_list" | "subscription_tier";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  value: boolean | number | string[];
  category: "core" | "social" | "monetization" | "experimental" | "wellbeing" | "ai";
}

const REDIS_KEY = "storyforge:feature_flags";

function envFallback(key: string, fallback: boolean): boolean {
  const v = process.env[`NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`];
  if (v == null) return fallback;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

// Default flags — same IDs as before
const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    id: "payments",
    name: "Payments",
    description: "Stripe subscription checkout and billing",
    type: "boolean",
    enabled: false,
    value: false,
    category: "monetization",
  },
  {
    id: "ai_assist",
    name: "AI Writing Assistant",
    description: "Master toggle for all AI-powered writing features",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_writing_suggestions",
    name: "AI Writing Suggestions",
    description: "AI-powered inline writing suggestions in the editor",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_character_development",
    name: "AI Character Development",
    description: "AI-generated character traits, backstories, and arcs",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_plot_analysis",
    name: "AI Plot Analysis",
    description: "AI review of story structure, pacing, and conflict",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_style_consistency",
    name: "AI Style Consistency",
    description: "AI analysis of writing style and voice consistency",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "ai_research_assistant",
    name: "AI Research Assistant",
    description: "AI-powered writing research and fact-checking",
    type: "boolean",
    enabled: false,
    value: false,
    category: "ai",
  },
  {
    id: "projects_v2",
    name: "Projects V2",
    description: "Next-generation project editor with advanced features",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "wellbeing",
    name: "Writing Wellbeing",
    description: "Break reminders, anti-burnout features, streak recovery",
    type: "boolean",
    enabled: true,
    value: true,
    category: "wellbeing",
  },
  {
    id: "design_system_v2",
    name: "Design System V2",
    description: "Updated design system with new tokens and components",
    type: "boolean",
    enabled: false,
    value: false,
    category: "core",
  },
  {
    id: "real_time_collaboration",
    name: "Real-time Collaboration",
    description: "Live co-authoring and presence indicators",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "groups_feature",
    name: "Writing Groups",
    description: "Create and join writing groups with shared goals",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "public_feed",
    name: "Public Story Feed",
    description: "Discover and read public stories from other writers",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "activity_feed",
    name: "Activity Feed",
    description: "Friends' writing activity feed (projects, badges, streaks)",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "writing_stats",
    name: "Writing Statistics",
    description: "Personal writing statistics dashboard with trends and charts",
    type: "boolean",
    enabled: true,
    value: true,
    category: "core",
  },
  {
    id: "comments",
    name: "Project Comments",
    description: "Comment and discussion on projects",
    type: "boolean",
    enabled: true,
    value: true,
    category: "social",
  },
  {
    id: "export",
    name: "Project Export",
    description: "Export projects as Markdown",
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
    description: "Save and restore previous versions of projects",
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

let cachedFlags: FeatureFlag[] | null = null;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9_]/g, "_");
}

export async function loadFlags(): Promise<FeatureFlag[]> {
  try {
    const redis = getRedis();
    const stored = await redis.get(REDIS_KEY);
    if (stored && typeof stored === "object") {
      return stored as FeatureFlag[];
    }
  } catch {
    // Redis unavailable — fall through to defaults
  }

  // Env-var fallback
  return DEFAULT_FLAGS.map((f) => ({
    ...f,
    enabled: envFallback(f.id, f.enabled as boolean),
    value: envFallback(f.id, f.value as boolean),
  }));
}

export function getFlagsSync(): FeatureFlag[] {
  if (cachedFlags) return cachedFlags;
  return DEFAULT_FLAGS;
}

export async function initFlags(): Promise<void> {
  cachedFlags = await loadFlags();
}

export async function isEnabled(key: string): Promise<boolean> {
  const flags = cachedFlags ?? (await loadFlags());
  const flag = flags.find((f) => f.id === normalizeKey(key));
  return flag?.enabled ?? false;
}

export function isEnabledSync(key: string): boolean {
  const flags = cachedFlags ?? DEFAULT_FLAGS;
  const flag = flags.find((f) => f.id === normalizeKey(key));
  return flag?.enabled ?? false;
}
