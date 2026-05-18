import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();

  const [
    totalWords,
    projectCount,
    characterCount,
    badgeCount,
    currentStreak,
    longestStreak,
    goalsCompleted,
  ] = await Promise.all([
    // Total words
    prisma.project.aggregate({ where: { userId: user.id }, _sum: { wordCount: true } }),
    // Project count
    prisma.project.count({ where: { userId: user.id } }),
    // Character count
    prisma.character.count({ where: { userId: user.id } }),
    // Badge count
    prisma.userBadge.count({ where: { userId: user.id } }),
    // Current streak (simplified — last 90 days)
    prisma.progressLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 90,
    }),
    // Longest streak will reuse the same data
    prisma.progressLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 365,
    }),
    // Goals
    prisma.goal.count({ where: { userId: user.id } }),
  ]);

  // Calculate streaks
  const daysWithProgress = new Set(
    currentStreak.map((l) => l.timestamp.toISOString().split("T")[0])
  );
  let streak = 0;
  let maxStreak = 0;
  let currentRun = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (daysWithProgress.has(key)) {
      currentRun++;
      if (currentRun > maxStreak) maxStreak = currentRun;
    } else {
      if (i === 0) streak = currentRun;
      currentRun = 0;
    }
  }
  if (streak === 0) streak = currentRun;

  // Word count per day for last 30 days
  const last30Days = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30Days.set(d.toISOString().split("T")[0], 0);
  }

  const recentLogs = await prisma.progressLog.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  for (const log of recentLogs) {
    const day = log.timestamp.toISOString().split("T")[0];
    last30Days.set(day, (last30Days.get(day) || 0) + log.value);
  }

  const trend = Array.from(last30Days.entries())
    .map(([date, words]) => ({ date, words }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Genre breakdown
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { genre: true, wordCount: true },
  });
  const genres: Record<string, number> = {};
  for (const p of projects) {
    const g = p.genre || "Uncategorized";
    genres[g] = (genres[g] || 0) + p.wordCount;
  }

  return NextResponse.json({
    totalWords: totalWords._sum.wordCount || 0,
    projectCount,
    characterCount,
    badgeCount,
    currentStreak: streak,
    longestStreak: maxStreak,
    goalsCompleted,
    trend,
    genres: Object.entries(genres).map(([name, words]) => ({ name, words })),
  });
}
