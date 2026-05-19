import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const createCompetitionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(["weekly", "monthly", "special"]).optional(),
  genre: z.string().max(50).optional(),
  minWords: z.number().min(0).optional(),
  maxWords: z.number().min(0).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(["upcoming", "active", "completed"]).optional(),
});

export async function GET(request: NextRequest) {
  await requireUser();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status ? { status } : {};
  const competitions = await prisma.competition.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return NextResponse.json(competitions);
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const user = await requireUser();
  const body = await request.json();

  const parsed = createCompetitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const competition = await prisma.competition.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type || "weekly",
      genre: parsed.data.genre,
      minWords: parsed.data.minWords ?? 0,
      maxWords: parsed.data.maxWords,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      status: parsed.data.status || "upcoming",
      createdBy: user.id,
    },
  });

  auditLog({
    userId: user.id,
    action: "competition.create",
    entityId: competition.id,
    entityType: "competition",
    metadata: { title: competition.title },
  });

  return NextResponse.json(competition, { status: 201 });
}
