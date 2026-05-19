import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const { allowed } = await checkRateLimit(`${RateLimitTiers.WRITE.keyPrefix}:${ip}`, RateLimitTiers.WRITE.maxRequests);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await requireUser();
  const { targetUserId } = await request.json();

  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId: user.id, followeeId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: user.id, followeeId: targetUserId },
  });

  return NextResponse.json({ following: true });
});
