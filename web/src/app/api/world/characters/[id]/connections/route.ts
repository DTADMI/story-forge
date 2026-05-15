import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const character = await prisma.character.findFirst({
    where: { id, userId: user.id },
  });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const relationships = await prisma.characterRelationship.findMany({
    where: {
      OR: [{ characterId: id }, { relatedId: id }],
    },
    include: {
      character: { select: { id: true, name: true } },
      related: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(relationships);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();

  if (!body.relatedId || !body.type) {
    return NextResponse.json({ error: "relatedId and type are required" }, { status: 400 });
  }

  const character = await prisma.character.findFirst({
    where: { id, userId: user.id },
  });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const related = await prisma.character.findFirst({
    where: { id: body.relatedId, userId: user.id },
  });
  if (!related) return NextResponse.json({ error: "Related character not found" }, { status: 404 });

  const relationship = await prisma.characterRelationship.create({
    data: {
      characterId: id,
      relatedId: body.relatedId,
      type: body.type,
      description: body.description,
    },
  });

  return NextResponse.json(relationship, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const character = await prisma.character.findFirst({
    where: { id, userId: user.id },
  });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const relationshipId = searchParams.get("relationshipId");
  if (!relationshipId)
    return NextResponse.json({ error: "relationshipId required" }, { status: 400 });

  const rel = await prisma.characterRelationship.findFirst({
    where: {
      id: relationshipId,
      OR: [{ characterId: id }, { relatedId: id }],
    },
  });
  if (!rel) return NextResponse.json({ error: "Relationship not found" }, { status: 404 });

  await prisma.characterRelationship.delete({ where: { id: relationshipId } });
  return NextResponse.json({ deleted: true });
}
