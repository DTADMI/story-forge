import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: id, userId: user.id } },
    create: { groupId: id, userId: user.id, role: "member" },
    update: {},
  });
  return NextResponse.json({ joined: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await prisma.groupMember.deleteMany({ where: { groupId: id, userId: user.id } });
  return NextResponse.json({ left: true });
}
