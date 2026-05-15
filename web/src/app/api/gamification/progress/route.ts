import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const { value, goalId } = await request.json();
  const log = await prisma.progressLog.create({
    data: { userId: user.id, goalId: goalId || undefined, value: Number(value) || 0 },
  });
  // Award 1 Ink per 500 words
  const words = Number(value) || 0;
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
}
