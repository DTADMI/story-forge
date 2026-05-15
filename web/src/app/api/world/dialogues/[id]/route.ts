import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const dialogue = await prisma.dialogue.findFirst({
    where: { id, userId: user.id },
    include: { project: true, timelineEvents: true },
  });
  if (!dialogue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dialogue);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();
  const dialogue = await prisma.dialogue.update({ where: { id, userId: user.id }, data: body });
  return NextResponse.json(dialogue);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.dialogue.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ deleted: true });
}
