import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const era = await prisma.era.findFirst({
    where: { id, userId: user.id },
    include: { project: true },
  });
  if (!era) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(era);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();
  const era = await prisma.era.update({
    where: { id, userId: user.id },
    data: body,
  });
  return NextResponse.json(era);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.era.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ deleted: true });
}
