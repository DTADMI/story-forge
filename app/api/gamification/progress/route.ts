import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { z } from "zod";

const logProgressSchema = z.object({
  value: z.number().min(0),
  goalId: z.string().optional(),
  type: z.string().optional(),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json();

  const parsed = logProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const log = await prisma.progressLog.create({
    data: { userId: user.id, goalId: parsed.data.goalId || undefined, value: parsed.data.value },
  });

  const words = parsed.data.value;
  const inkEarned = Math.floor(words / 500);
  if (inkEarned > 0) {
    const wallet = await prisma.inkPot.upsert({
      where: { userId: user.id },
      create: { userId: user.id, balance: inkEarned },
      update: { balance: { increment: inkEarned } },
    });
    await prisma.inkTx.create({
      data: { userId: user.id, potId: wallet.id, amount: inkEarned, reason: "Writing progress" },
    });
  }

  // Award word-count badges
  const totalWords = await prisma.progressLog.aggregate({
    where: { userId: user.id },
    _sum: { value: true },
  });
  const total = totalWords._sum.value ?? 0;
  const wordBadges = await prisma.badge.findMany({
    where: { threshold: { lte: total }, type: "total_words" },
  });
  for (const badge of wordBadges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
      create: { userId: user.id, badgeId: badge.id },
      update: {},
    });
  }

  // Award streak badges
  const recentLogs = await prisma.progressLog.findMany({
    where: { userId: user.id },
    orderBy: { timestamp: "desc" },
    take: 90,
    select: { timestamp: true },
  });
  const daysSet = new Set(recentLogs.map((l) => l.timestamp.toISOString().split("T")[0]));
  let streakCount = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (daysSet.has(d.toISOString().split("T")[0])) streakCount++;
    else break;
  }
  const streakBadges = await prisma.badge.findMany({
    where: { threshold: { lte: streakCount }, type: "streak" },
  });
  for (const badge of streakBadges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
      create: { userId: user.id, badgeId: badge.id },
      update: {},
    });
  }

  // Check goal completion
  const activeGoals = await prisma.goal.findMany({ where: { userId: user.id } });
  for (const goal of activeGoals) {
    const periodStart = new Date();
    if (goal.cadence === "daily") {
      periodStart.setHours(0, 0, 0, 0);
    } else if (goal.cadence === "weekly") {
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      periodStart.setHours(0, 0, 0, 0);
    }
    const periodProgress = await prisma.progressLog.aggregate({
      where: { userId: user.id, timestamp: { gte: periodStart }, goalId: goal.id },
      _sum: { value: true },
    });
    const progress = periodProgress._sum.value ?? 0;
    if (progress >= goal.target) {
      try {
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "goal_complete",
            entityId: goal.id,
            entityType: "goal",
            metadata: { goalType: goal.type, target: goal.target, achieved: progress },
          },
        });
      } catch {
        // activity creation is non-critical
      }
    }
  }

  return NextResponse.json({ log, inkEarned, totalWords: total, streakDays: streakCount });
});
