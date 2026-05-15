import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface GalaxyNode {
  id: string;
  type: "character" | "event" | "location" | "organization";
  label: string;
  group: string;
}

interface GalaxyEdge {
  source: string;
  target: string;
  type: string;
  strength: number;
  label?: string;
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const where = projectId ? { userId: user.id, projectId } : { userId: user.id };

  const [characters, timelineEvents, organizations, locations, characterRelationships] =
    await Promise.all([
      prisma.character.findMany({ where, select: { id: true, name: true, projectId: true } }),
      prisma.timelineEvent.findMany({
        where,
        select: {
          id: true,
          title: true,
          projectId: true,
          characters: { select: { id: true } },
          locations: { select: { id: true } },
        },
      }),
      prisma.organization.findMany({
        where,
        select: { id: true, name: true, projectId: true },
      }),
      prisma.location.findMany({
        where,
        select: { id: true, name: true, projectId: true },
      }),
      prisma.characterRelationship.findMany({
        where: {
          character: { userId: user.id, ...(projectId ? { projectId } : {}) },
        },
        select: {
          characterId: true,
          relatedId: true,
          type: true,
        },
      }),
    ]);

  const nodes: GalaxyNode[] = [];
  const edges: GalaxyEdge[] = [];

  for (const c of characters) {
    nodes.push({ id: c.id, type: "character", label: c.name, group: c.projectId || "ungrouped" });
  }
  for (const e of timelineEvents) {
    nodes.push({ id: e.id, type: "event", label: e.title, group: e.projectId || "ungrouped" });
  }
  for (const o of organizations) {
    nodes.push({ id: o.id, type: "organization", label: o.name, group: o.projectId || "ungrouped" });
  }
  for (const l of locations) {
    nodes.push({ id: l.id, type: "location", label: l.name, group: l.projectId || "ungrouped" });
  }

  // Character relationships
  for (const cr of characterRelationships) {
    edges.push({
      source: cr.characterId,
      target: cr.relatedId,
      type: cr.type,
      strength: 1,
      label: cr.type,
    });
  }

  // TimelineEvent -> Character links (weighted by co-occurrence count)
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
    edges.push({ source: a, target: b, type: "co-occurrence", strength: Math.min(count, 5), label: "co-occurrence" });
  }

  // TimelineEvent -> Location links
  for (const e of timelineEvents) {
    for (const l of e.locations) {
      edges.push({ source: e.id, target: l.id, type: "located_in", strength: 1, label: "located in" });
    }
  }

  // Character -> Organization links (via shared project membership)
  const projectGroups = new Map<string, string[]>();
  for (const c of characters) {
    const g = c.projectId || "ungrouped";
    if (!projectGroups.has(g)) projectGroups.set(g, []);
    projectGroups.get(g)!.push(c.id);
  }
  for (const o of organizations) {
    const g = o.projectId || "ungrouped";
    if (!projectGroups.has(g)) projectGroups.set(g, []);
    projectGroups.get(g)!.push(o.id);
  }

  return NextResponse.json({ nodes, edges });
}
