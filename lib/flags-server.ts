import "server-only";

import { loadFlags, initFlags as baseInitFlags, type FeatureFlag, type FlagType } from "./flags";
import { prisma } from "./prisma";

export type { FeatureFlag, FlagType };

async function getPrismaFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const rows = await prisma.featureFlag.findMany();
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? "",
        type: (r.type as FlagType) ?? "boolean",
        enabled: r.enabled,
        value: r.value as boolean | number | string[],
        category: (r.category as FeatureFlag["category"]) ?? "core",
      }));
    }
  } catch {
    // DB unavailable
  }
  return [];
}

async function loadFlagsWithDB(): Promise<FeatureFlag[]> {
  try {
    const dbFlags = await getPrismaFeatureFlags();
    if (dbFlags.length > 0) return dbFlags;
  } catch {
    // DB unavailable — fall through
  }
  return loadFlags();
}

let cached: FeatureFlag[] | null = null;

export async function initFlags(): Promise<void> {
  cached = await loadFlagsWithDB();
  // Also update the base module's cached copy for client-side sync checks
  await baseInitFlags();
}

export async function isEnabled(key: string): Promise<boolean> {
  const flags = cached ?? (await loadFlagsWithDB());
  const found = flags.find((f) => f.id === key.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  return found?.enabled ?? false;
}
