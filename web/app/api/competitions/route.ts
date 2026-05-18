import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

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

  const competition = await prisma.competition.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type || "weekly",
      genre: body.genre,
      minWords: body.minWords ?? 0,
      maxWords: body.maxWords,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status || "upcoming",
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
