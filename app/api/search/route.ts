import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/flags-server";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ results: [] });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const scope = searchParams.get("scope") || "my";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchEnabled = await isEnabled("search");
  if (!searchEnabled) {
    return NextResponse.json({ results: [], disabled: true });
  }

  // Prepare tsquery — plainto_tsquery handles user input safely
  const tsquery = q
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  // Search projects with full-text search
  const projectsRaw = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      title: string;
      description: string | null;
      wordCount: number;
      genre: string | null;
      username: string | null;
      name: string | null;
      rank: number;
    }>
  >(
    `SELECT p.id, p.title, p.description, p."wordCount", p.genre,
            u.username, u.name,
            ts_rank(
              to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, '')),
              to_tsquery('english', $1)
            ) AS rank
     FROM "Project" p
     JOIN "User" u ON p."userId" = u.id
     WHERE (
       ${
         scope === "public"
           ? `(p."isPublic" = true OR p."defaultScope" = 'PUBLIC_ANYONE')`
           : `p."userId" = $2`
       }
     )
       AND to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.description, ''))
           @@ to_tsquery('english', $1)
     ORDER BY rank DESC
     LIMIT 20`,
    tsquery,
    ...(scope === "public" ? [] : [user.id])
  );

  const results = projectsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    wordCount: p.wordCount,
    genre: p.genre,
    relevance: Number(p.rank),
    user: { username: p.username, name: p.name },
  }));

  // Also search world-building entities if scope is "my"
  let characters: Array<{ id: string; name: string; type: string }> = [];
  let locations: Array<{ id: string; name: string; type: string }> = [];
  let organizations: Array<{ id: string; name: string; type: string }> = [];
  let species: Array<{ id: string; name: string; type: string }> = [];
  let encyclopedia: Array<{ id: string; title: string; type: string; category: string }> = [];

  if (scope === "my") {
    const worldQuery = `
      SELECT id, name, 'character' AS type,
             ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio, '')), to_tsquery('english', $1)) AS rank
      FROM "Character"
      WHERE "userId" = $2
        AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio, '')) @@ to_tsquery('english', $1)
      ORDER BY rank DESC LIMIT 5`;

    characters = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; type: string }>>(
      worldQuery,
      tsquery,
      user.id
    );

    locations = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; type: string }>>(
      `SELECT id, name, 'location' AS type,
              ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')), to_tsquery('english', $1)) AS rank
       FROM "Location"
       WHERE "userId" = $2
         AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
       ORDER BY rank DESC LIMIT 5`,
      tsquery,
      user.id
    );

    organizations = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; type: string }>>(
      `SELECT id, name, 'organization' AS type,
              ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')), to_tsquery('english', $1)) AS rank
       FROM "Organization"
       WHERE "userId" = $2
         AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
       ORDER BY rank DESC LIMIT 5`,
      tsquery,
      user.id
    );

    species = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; type: string }>>(
      `SELECT id, name, 'species' AS type,
              ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')), to_tsvector('english', $1)) AS rank
       FROM "Species"
       WHERE "userId" = $2
         AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
       ORDER BY rank DESC LIMIT 5`,
      tsquery,
      user.id
    );

    encyclopedia = await prisma.$queryRawUnsafe<
      Array<{ id: string; title: string; type: string; category: string }>
    >(
      `SELECT id, title, 'encyclopedia' AS type, category,
              ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')), to_tsquery('english', $1)) AS rank
       FROM "EncyclopediaEntry"
       WHERE "userId" = $2
         AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')) @@ to_tsquery('english', $1)
       ORDER BY rank DESC LIMIT 5`,
      tsquery,
      user.id
    );
  }

  const worldResults = [
    ...characters.map((c) => ({ ...c, _type: "character" as const })),
    ...locations.map((l) => ({ ...l, _type: "location" as const })),
    ...organizations.map((o) => ({ ...o, _type: "organization" as const })),
    ...species.map((s) => ({ ...s, _type: "species" as const })),
    ...encyclopedia.map((e) => ({
      id: e.id,
      title: e.title,
      _type: "encyclopedia" as const,
      category: e.category,
    })),
  ];

  return NextResponse.json({ results, worldResults, query: q });
}
