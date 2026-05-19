import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { z } from "zod";

const logProgressSchema = z.object({
  value: z.number().min(0),
  goalId: z.string().optional(),
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
  // Check milestones
  const totalWords = await prisma.progressLog.aggregate({
    where: { userId: user.id },
    _sum: { value: true },
  });
  const total = totalWords._sum.value ?? 0;
  const badges = await prisma.badge.findMany({
    where: { threshold: { lte: total } },
  });
  for (const badge of badges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
      create: { userId: user.id, badgeId: badge.id },
      update: {},
    });
  }
  return NextResponse.json({ log, inkEarned, totalWords: total });
});
