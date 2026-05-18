import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCached, buildCacheKey } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const user = await getUser();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "weekly";
  const scope = searchParams.get("scope") || "friends";

  const cacheKey = buildCacheKey("leaderboard", period, scope, user?.id || "anon");
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  let dateFilter: Date;
  const now = new Date();
  if (period === "monthly") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "alltime") {
    dateFilter = new Date(0);
  } else {
    // Weekly: last 7 days
    dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get progress logs in period, aggregate by user
  const logs = await prisma.progressLog.groupBy({
    by: ["userId"],
    where: { timestamp: { gte: dateFilter } },
    _sum: { value: true },
  });

  // Get user info for each
  const userIds = logs.map((l) => l.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, username: true, image: true },
  });

  const leaderboard = logs
    .map((l) => {
      const u = users.find((u) => u.id === l.userId);
      return {
        userId: l.userId,
        name: u?.name || u?.username || "Anonymous",
        username: u?.username,
        words: l._sum.value || 0,
      };
    })
    .filter((e) => e.words > 0)
    .sort((a, b) => b.words - a.words)
    .slice(0, 50)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  await setCached(cacheKey, leaderboard, 900); // 15 min cache

  return NextResponse.json(leaderboard);
}
