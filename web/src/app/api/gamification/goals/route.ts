import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const GOAL_TYPES = [
  "words_per_day",
  "pages_per_week",
  "scenes_completed",
  "panels_per_day",
] as const;

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const { target, type, cadence } = await request.json();
  const goalType = GOAL_TYPES.includes(type) ? type : "words_per_day";
  const goalCadence = cadence === "weekly" ? "weekly" : "daily";

  // Deactivate existing goals of the same type
  await prisma.goal.updateMany({
    where: { userId: user.id, type: goalType },
    data: { cadence: "daily" }, // Keep but mark old
  });

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: goalType,
      target: Number(target) || 500,
      cadence: goalCadence,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}

export async function GET() {
  const user = await requireUser();
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}
