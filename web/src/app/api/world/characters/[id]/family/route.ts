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
      character: { select: { id: true, name: true, imageUrl: true } },
      related: { select: { id: true, name: true, imageUrl: true } },
    },
    orderBy: { type: "asc" },
  });

  const grouped: Record<
    string,
    Array<{
      id: string;
      type: string;
      description: string | null;
      direction: "outgoing" | "incoming";
      source: { id: string; name: string; imageUrl: string | null };
      target: { id: string; name: string; imageUrl: string | null };
    }>
  > = {};

  for (const rel of relationships) {
    const key = rel.type;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: rel.id,
      type: rel.type,
      description: rel.description,
      direction: rel.characterId === id ? "outgoing" : "incoming",
      source: rel.character,
      target: rel.related,
    });
  }

  return NextResponse.json(grouped);
}
