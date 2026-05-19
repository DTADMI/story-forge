import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGoalSchema = z.object({
  target: z.number().min(1, "Target must be at least 1"),
  type: z.enum(["words_per_day", "pages_per_week", "scenes_completed", "panels_per_day"]).optional(),
  cadence: z.enum(["daily", "weekly"]).optional(),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();

  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const goalType = parsed.data.type ?? "words_per_day";
  const goalCadence = parsed.data.cadence ?? "daily";

  // Deactivate existing goals of the same type
  await prisma.goal.updateMany({
    where: { userId: user.id, type: goalType },
    data: { cadence: "daily" }, // Keep but mark old
  });

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: goalType,
      target: parsed.data.target,
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
