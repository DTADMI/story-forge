import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body: { targetUserId: string } = await request.json();

  if (!body.targetUserId || body.targetUserId === user.id) {
    return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
  }

  const existing = await prisma.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: body.targetUserId } },
  });

  if (existing) {
    await prisma.userBlock.delete({ where: { id: existing.id } });
    return NextResponse.json({ blocked: false });
  }

  await prisma.userBlock.create({
    data: { blockerId: user.id, blockedId: body.targetUserId },
  });

  return NextResponse.json({ blocked: true });
}

export async function GET() {
  const user = await requireUser();
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: user.id },
    include: { blocked: { select: { id: true, name: true, email: true, image: true } } },
  });
  return NextResponse.json(blocks.map((b) => ({ ...b, blocked: undefined, ...b.blocked })));
}
