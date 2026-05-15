import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { RelationshipGraph } from "@/components/world/relationship-graph";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function CharacterRelationshipsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;

  const character = await prisma.character.findFirst({
    where: { id, userId: user.id },
  });
  if (!character) notFound();

  const timelineEvents = await prisma.timelineEvent.findMany({
    where: {
      userId: user.id,
      characters: { some: { id: character.id } },
    },
    include: {
      characters: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  });

  const coOccurrence = new Map<
    string,
    { character: { id: string; name: string; imageUrl: string | null }; count: number }
  >();

  for (const event of timelineEvents) {
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

  const relatedCharacters = Array.from(coOccurrence.values())
    .sort((a, b) => b.count - a.count)
    .map((rc) => ({
      id: rc.character.id,
      name: rc.character.name,
      imageUrl: rc.character.imageUrl,
      initials: getInitials(rc.character.name),
      count: rc.count,
    }));

  const centralCharacter = {
    id: character.id,
    name: character.name,
    imageUrl: character.imageUrl,
    initials: getInitials(character.name),
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/world/characters/${id}`} className="text-sm text-fg/40 hover:text-brand">
          Back to {character.name}
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold mb-2">Relationship Graph</h1>
      <p className="text-fg/60 text-sm mb-6">
        Characters connected through shared timeline events. Line thickness reflects relationship
        strength (co-occurrence count).
      </p>

      <Card className="p-4">
        <RelationshipGraph
          centralCharacter={centralCharacter}
          relatedCharacters={relatedCharacters}
        />
      </Card>

      {relatedCharacters.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-3">Legend</h2>
          <div className="space-y-2">
            {relatedCharacters.map((rc) => (
              <div key={rc.id} className="flex items-center gap-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
                  {rc.initials}
                </div>
                <span className="font-medium">{rc.name}</span>
                <span className="text-fg/40">
                  {rc.count} shared event{rc.count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
