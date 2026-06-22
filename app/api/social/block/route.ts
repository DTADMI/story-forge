import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const blockSchema = z.object({
  targetUserId: z.string().min(1, "targetUserId is required"),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();

  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
  }
  if (parsed.data.targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  const existing = await prisma.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: parsed.data.targetUserId } },
  });

  if (existing) {
    await prisma.userBlock.delete({ where: { id: existing.id } });
    return NextResponse.json({ blocked: false });
  }

  await prisma.userBlock.create({
    data: { blockerId: user.id, blockedId: parsed.data.targetUserId },
  });

  return NextResponse.json({ blocked: true });
}

export async function GET() {
  const user = await requireUser();
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: user.id },
    include: { blocked: { select: { id: true, name: true, username: true, image: true } } },
  });
  return NextResponse.json(blocks.map((b) => ({ ...b, blocked: undefined, ...b.blocked })));
}
