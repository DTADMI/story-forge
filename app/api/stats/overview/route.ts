import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();

  const [totalWords, projectCount, characterCount, badgeCount, streakData, goalsCompleted] =
    await Promise.all([
      prisma.project.aggregate({ where: { userId: user.id }, _sum: { wordCount: true } }),
      prisma.project.count({ where: { userId: user.id } }),
      prisma.character.count({ where: { userId: user.id } }),
      prisma.userBadge.count({ where: { userId: user.id } }),
      prisma.progressLog.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: "desc" },
        select: { timestamp: true, value: true },
        take: 365,
      }),
      prisma.goal.count({ where: { userId: user.id } }),
    ]);

  const daysWithProgress = new Set(
    streakData.map((l) => l.timestamp.toISOString().split("T")[0])
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

  const last30Days = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30Days.set(d.toISOString().split("T")[0], 0);
  }

  for (const log of streakData) {
    const day = log.timestamp.toISOString().split("T")[0];
    if (last30Days.has(day)) {
      last30Days.set(day, (last30Days.get(day) || 0) + log.value);
    }
  }

  const trend = Array.from(last30Days.entries())
    .map(([date, words]) => ({ date, words }))
    .sort((a, b) => a.date.localeCompare(b.date));

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
