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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: ((r as any).type as FlagType) ?? "boolean",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enabled: (r as any).enabled,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (r as any).value as boolean | number | string[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: ((r as any).category as FeatureFlag["category"]) ?? "core",
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
