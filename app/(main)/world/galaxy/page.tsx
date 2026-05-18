import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalaxyGraph } from "@/components/world/galaxy-graph";

export default async function GalaxyPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  // Fetch galaxy data directly (server component pattern matching other pages)
  const [characters, timelineEvents, organizations, locations, characterRelationships] =
    await Promise.all([
      prisma.character.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, projectId: true },
      }),
      prisma.timelineEvent.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          projectId: true,
          characters: { select: { id: true } },
          locations: { select: { id: true } },
        },
      }),
      prisma.organization.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, projectId: true },
      }),
      prisma.location.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, projectId: true },
      }),
      prisma.characterRelationship.findMany({
        where: { character: { userId: user.id } },
        select: { characterId: true, relatedId: true, type: true },
      }),
    ]);

  const nodes: {
    id: string;
    type: "character" | "event" | "location" | "organization";
    label: string;
    group: string;
  }[] = [];
  const edges: {
    source: string;
    target: string;
    type: string;
    strength: number;
    label?: string;
  }[] = [];

  for (const c of characters)
    nodes.push({ id: c.id, type: "character", label: c.name, group: c.projectId || "ungrouped" });
  for (const e of timelineEvents)
    nodes.push({ id: e.id, type: "event", label: e.title, group: e.projectId || "ungrouped" });
  for (const o of organizations)
    nodes.push({
      id: o.id,
      type: "organization",
      label: o.name,
      group: o.projectId || "ungrouped",
    });
  for (const l of locations)
    nodes.push({ id: l.id, type: "location", label: l.name, group: l.projectId || "ungrouped" });

  for (const cr of characterRelationships) {
    edges.push({
      source: cr.characterId,
      target: cr.relatedId,
      type: cr.type,
      strength: 1,
      label: cr.type,
    });
  }

  const eventCharPairs = new Map<string, number>();
  for (const e of timelineEvents) {
    for (const c1 of e.characters) {
      for (const c2 of e.characters) {
        if (c1.id === c2.id) continue;
        const key = [c1.id, c2.id].sort().join(":");
        eventCharPairs.set(key, (eventCharPairs.get(key) || 0) + 1);
      }
    }
  }
  for (const [key, count] of eventCharPairs) {
    const [a, b] = key.split(":");
    edges.push({
      source: a,
      target: b,
      type: "co-occurrence",
      strength: Math.min(count, 5),
      label: "co-occurrence",
    });
  }

  for (const e of timelineEvents) {
    for (const l of e.locations) {
      edges.push({
        source: e.id,
        target: l.id,
        type: "located_in",
        strength: 1,
        label: "located in",
      });
    }
  }

  const galaxyData = { nodes, edges };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Galaxy View</h1>
        <p className="text-fg/60 mt-1">
          Interconnected visualization of your world — characters, events, locations, and
          organizations.
        </p>
      </header>

      <GalaxyGraph data={galaxyData} />
    </main>
  );
}
