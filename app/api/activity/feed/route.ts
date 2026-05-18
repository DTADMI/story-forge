import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCached, buildCacheKey } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = Math.min(Number(searchParams.get("take")) || 20, 50);

  // Get IDs of users this user follows
  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followeeId: true },
  });
  const followeeIds = following.map((f) => f.followeeId);
  followeeIds.push(user.id); // Include own activity

  const cacheKey = buildCacheKey("activity", "feed", user.id, String(cursor), String(take));
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const activities = await prisma.activity.findMany({
    where: { userId: { in: followeeIds } },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = activities.length > take;
  const items = hasMore ? activities.slice(0, take) : activities;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  const result = { items, nextCursor };
  await setCached(cacheKey, result, 300); // 5 min cache

  return NextResponse.json(result);
}
