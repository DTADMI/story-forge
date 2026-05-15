import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          project: { select: { id: true, title: true, wordCount: true, description: true } },
        },
      },
    },
  });

  if (!competition) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(competition);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.type !== undefined) data.type = body.type;
  if (body.genre !== undefined) data.genre = body.genre;
  if (body.minWords !== undefined) data.minWords = body.minWords;
  if (body.maxWords !== undefined) data.maxWords = body.maxWords;
  if (body.status !== undefined) data.status = body.status;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);

  const competition = await prisma.competition.update({ where: { id }, data });

  auditLog({
    userId: user.id,
    action: "competition.update",
    entityId: id,
    entityType: "competition",
    metadata: data,
  });

  return NextResponse.json(competition);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const user = await requireUser();
  const { id } = await params;

  await prisma.competition.delete({ where: { id } });

  auditLog({
    userId: user.id,
    action: "competition.delete",
    entityId: id,
    entityType: "competition",
  });

  return NextResponse.json({ success: true });
}
