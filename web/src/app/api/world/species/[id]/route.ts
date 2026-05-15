import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const species = await prisma.species.findFirst({
    where: { id, userId: user.id },
    include: { project: true },
  });
  if (!species) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(species);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();
  const species = await prisma.species.update({
    where: { id, userId: user.id },
    data: body,
  });
  return NextResponse.json(species);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.species.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ deleted: true });
}
