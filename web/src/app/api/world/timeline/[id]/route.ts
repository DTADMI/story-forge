import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await prisma.timelineEvent.findFirst({
    where: { id, userId: user.id },
    include: { characters: true, locations: true, project: true },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { characterIds, locationIds, ...rest } = await request.json();
  const event = await prisma.timelineEvent.update({
    where: { id, userId: user.id },
    data: {
      ...rest,
      characters:
        characterIds !== undefined
          ? { set: characterIds.map((cid: string) => ({ id: cid })) }
          : undefined,
      locations:
        locationIds !== undefined
          ? { set: locationIds.map((lid: string) => ({ id: lid })) }
          : undefined,
    },
    include: { characters: true, locations: true },
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.timelineEvent.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ deleted: true });
}
