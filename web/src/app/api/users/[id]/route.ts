import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, bio: true, website: true, image: true, created_at: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireUser();
  const { id } = await params;
  if (currentUser.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      username: body.username,
      bio: body.bio,
      website: body.website,
    },
  });
  return NextResponse.json(user);
}
