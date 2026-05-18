import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getUser();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const scope = searchParams.get("scope") || "my";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const whereBase =
    scope === "public"
      ? { OR: [{ isPublic: true }, { defaultScope: "PUBLIC_ANYONE" as const }] }
      : { userId: user?.id || "" };

  // Search own or public projects by title + description
  const projects = await prisma.project.findMany({
    where: {
      ...whereBase,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      wordCount: true,
      genre: true,
      user: { select: { username: true, name: true } },
    },
    take: 20,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ results: projects, query: q });
}
