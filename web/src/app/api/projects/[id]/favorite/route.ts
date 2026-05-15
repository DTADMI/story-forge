import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const existing = await prisma.projectFavorite.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (existing) {
    await prisma.projectFavorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.projectFavorite.create({
      data: { userId: user.id, projectId },
    });
  }

  const count = await prisma.projectFavorite.count({ where: { projectId } });
  const isFavorited = !existing;

  return NextResponse.json({ favorited: isFavorited, count });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const [existing, count] = await Promise.all([
    prisma.projectFavorite.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    }),
    prisma.projectFavorite.count({ where: { projectId } }),
  ]);

  return NextResponse.json({ favorited: Boolean(existing), count });
}
