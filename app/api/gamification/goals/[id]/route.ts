import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateGoalSchema = z.object({
  target: z.number().min(1).optional(),
  cadence: z.enum(["daily", "weekly"]).optional(),
  type: z
    .enum(["words_per_day", "pages_per_week", "scenes_completed", "panels_per_day"])
    .optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const goal = await prisma.goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const goal = await prisma.goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
