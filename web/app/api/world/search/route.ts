import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  excerpt: string;
  entityType: string;
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const term = q.trim();
  const contains = { contains: term, mode: "insensitive" as const };

  const [characters, locations, organizations, species, timelineEvents, encyclopediaEntries] =
    await Promise.all([
      prisma.character.findMany({
        where: {
          userId: user.id,
          OR: [{ name: contains }, { bio: contains }],
        },
        select: { id: true, name: true, bio: true },
        take: 20,
      }),
      prisma.location.findMany({
        where: {
          userId: user.id,
          OR: [{ name: contains }, { description: contains }],
        },
        select: { id: true, name: true, description: true },
        take: 20,
      }),
      prisma.organization.findMany({
        where: {
          userId: user.id,
          OR: [{ name: contains }, { description: contains }],
        },
        select: { id: true, name: true, description: true },
        take: 20,
      }),
      prisma.species.findMany({
        where: {
          userId: user.id,
          OR: [{ name: contains }, { description: contains }],
        },
        select: { id: true, name: true, description: true },
        take: 20,
      }),
      prisma.timelineEvent.findMany({
        where: {
          userId: user.id,
          title: contains,
        },
        select: { id: true, title: true, description: true },
        take: 20,
      }),
      prisma.encyclopediaEntry.findMany({
        where: {
          userId: user.id,
          OR: [{ title: contains }, { content: contains }],
        },
        select: { id: true, title: true, content: true },
        take: 20,
      }),
    ]);

  const results: SearchResult[] = [];

  for (const c of characters) {
    results.push({
      type: "character",
      id: c.id,
      title: c.name,
      excerpt: c.bio ?? "",
      entityType: "character",
    });
  }

  for (const l of locations) {
    results.push({
      type: "location",
      id: l.id,
      title: l.name,
      excerpt: l.description ?? "",
      entityType: "location",
    });
  }

  for (const o of organizations) {
    results.push({
      type: "organization",
      id: o.id,
      title: o.name,
      excerpt: o.description ?? "",
      entityType: "organization",
    });
  }

  for (const s of species) {
    results.push({
      type: "species",
      id: s.id,
      title: s.name,
      excerpt: s.description ?? "",
      entityType: "species",
    });
  }

  for (const t of timelineEvents) {
    results.push({
      type: "timelineEvent",
      id: t.id,
      title: t.title,
      excerpt: t.description ?? "",
      entityType: "timelineEvent",
    });
  }

  for (const e of encyclopediaEntries) {
    results.push({
      type: "encyclopediaEntry",
      id: e.id,
      title: e.title,
      excerpt: e.content.slice(0, 200),
      entityType: "encyclopediaEntry",
    });
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
