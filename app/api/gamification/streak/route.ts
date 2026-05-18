import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const logs = await prisma.progressLog.findMany({
    where: { userId: user.id },
    orderBy: { timestamp: "desc" },
    take: 90,
  });
  // Calculate consecutive days with progress
  const days = new Set<string>();
  for (const log of logs) {
    days.add(log.timestamp.toISOString().split("T")[0]);
  }
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (days.has(key)) streak++;
    else break;
  }
  return NextResponse.json({ streak, days: Array.from(days).length });
}
