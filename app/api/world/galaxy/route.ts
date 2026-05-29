import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { neo4jQuery } from "@/lib/neo4j";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformNeo4jToGalaxy(neo4jResult: any[]): {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
} {
  const nodeMap = new Map<string, GalaxyNode>();
  const edgeSet = new Set<string>();
  const edges: GalaxyEdge[] = [];

  for (const row of neo4jResult) {
    const n = row.n;
    const r = row.r;
    const m = row.m;

    if (n && !nodeMap.has(n.properties?.id || n.identity?.toString())) {
      const nodeId = n.properties?.id || n.identity?.toString();
      const labels = n.labels || [];
      let type: GalaxyNode["type"] = "character";
      if (labels.includes("Event")) type = "event";
      else if (labels.includes("Location")) type = "location";
      else if (labels.includes("Organization")) type = "organization";

      nodeMap.set(nodeId, {
        id: nodeId,
        type,
        label: n.properties?.name || n.properties?.title || nodeId,
        group: n.properties?.projectId || "ungrouped",
      });
    }

    if (m && !nodeMap.has(m.properties?.id || m.identity?.toString())) {
      const nodeId = m.properties?.id || m.identity?.toString();
      const labels = m.labels || [];
      let type: GalaxyNode["type"] = "character";
      if (labels.includes("Event")) type = "event";
      else if (labels.includes("Location")) type = "location";
      else if (labels.includes("Organization")) type = "organization";

      nodeMap.set(nodeId, {
        id: nodeId,
        type,
        label: m.properties?.name || m.properties?.title || nodeId,
        group: m.properties?.projectId || "ungrouped",
      });
    }

    if (r && n && m) {
      const sourceId = n.properties?.id || n.identity?.toString();
      const targetId = m.properties?.id || m.identity?.toString();
      const edgeKey = `${sourceId}:${targetId}:${r.type}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          source: sourceId,
          target: targetId,
          type: r.type,
          strength: 1,
          label: r.type,
        });
      }
    }
  }

  return { nodes: Array.from(nodeMap.values()), edges };
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const neo4jResult = await neo4jQuery(
    `MATCH (n)-[r]-(m) WHERE n.projectId = $projectId OR n.projectId IS NULL RETURN n, r, m LIMIT 500`,
    { projectId }
  );
  if (neo4jResult.length > 0) {
    return NextResponse.json(transformNeo4jToGalaxy(neo4jResult));
  }

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
    nodes.push({
      id: o.id,
      type: "organization",
      label: o.name,
      group: o.projectId || "ungrouped",
    });
  }
  for (const l of locations) {
    nodes.push({ id: l.id, type: "location", label: l.name, group: l.projectId || "ungrouped" });
  }

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

  return NextResponse.json({ nodes, edges });
}
