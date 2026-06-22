import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getRedis } from "@/lib/redis";
import { initFlags } from "@/lib/flags";
import { initFlags as initServerFlags } from "@/lib/flags-server";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

const REDIS_KEY = "storyforge:feature_flags";

export async function GET() {
  await requireAdmin();
  try {
    const redis = getRedis();
    const stored = await redis.get(REDIS_KEY);
    if (stored && typeof stored === "object") {
      return NextResponse.json(stored);
    }
  } catch {
    /* noop */
  }
  return NextResponse.json([]);
}

export async function PUT(request: NextRequest) {
  await requireAdmin();
  const flags = await request.json();

  if (!Array.isArray(flags) || flags.length === 0) {
    return NextResponse.json({ error: "Flags must be a non-empty array" }, { status: 400 });
  }

  // Persist to Redis
  try {
    const redis = getRedis();
    await redis.set(REDIS_KEY, JSON.stringify(flags));
  } catch {
    /* noop */
  }

  // Sync to database
  for (const flag of flags) {
    try {
      await prisma.featureFlag.upsert({
        where: { id: flag.id || flag.name },
        create: {
          id: flag.id || flag.name,
          name: flag.name || flag.id,
          description: flag.description,
          type: flag.type || "boolean",
          enabled: Boolean(flag.enabled),
          value: typeof flag.value === "boolean" ? flag.value : JSON.stringify(flag.value),
          category: flag.category || "core",
        },
        update: {
          enabled: Boolean(flag.enabled),
          value: typeof flag.value === "boolean" ? flag.value : JSON.stringify(flag.value),
        },
      });
    } catch {
      /* skip individual flag failures */
    }
  }

  // Invalidate all server-side flag caches
  try {
    await initFlags();
  } catch {
    /* noop */
  }
  try {
    await initServerFlags();
  } catch {
    /* noop */
  }

  auditLog({
    userId: "admin-action",
    action: "admin.flag_update",
    metadata: { flagCount: flags.length },
  });

  return NextResponse.json({ success: true });
}
