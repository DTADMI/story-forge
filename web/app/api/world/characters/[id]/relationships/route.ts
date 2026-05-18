import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/error-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const character = await prisma.character.findFirst({
    where: { id, userId: user.id },
    include: {
      timelineEvents: {
        include: {
          characters: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!character) return notFound("Character not found");

  const coOccurrence = new Map<
    string,
    { character: { id: string; name: string; imageUrl: string | null }; count: number }
  >();

  for (const event of character.timelineEvents) {
    for (const c of event.characters) {
      if (c.id === character.id) continue;
      const existing = coOccurrence.get(c.id);
      if (existing) {
        existing.count += 1;
      } else {
        coOccurrence.set(c.id, { character: c, count: 1 });
      }
    }
  }

  const relatedCharacters = Array.from(coOccurrence.values()).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    character: {
      id: character.id,
      name: character.name,
      imageUrl: character.imageUrl,
    },
    relatedCharacters,
  });
}
