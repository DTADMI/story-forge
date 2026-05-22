import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getRedis } from "@/lib/redis";
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
  try {
    const redis = getRedis();
    await redis.set(REDIS_KEY, JSON.stringify(flags));
  } catch {
    /* noop */
  }

  auditLog({
    userId: "admin",
    action: "admin.flag_update",
    metadata: { flagCount: Array.isArray(flags) ? flags.length : 0 },
  });

  return NextResponse.json({ success: true });
}
