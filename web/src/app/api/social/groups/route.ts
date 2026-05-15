import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const groups = await prisma.group.findMany({
    where: { OR: [{ isPrivate: false }, { members: { some: { userId: user.id } } }] },
    include: { members: { include: { user: { select: { id: true, name: true, username: true } } } } },
  });
  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const { name, description, isPrivate } = await request.json();
  const group = await prisma.group.create({
    data: {
      name,
      description,
      isPrivate: isPrivate ?? false,
      members: { create: { userId: user.id, role: "admin" } },
    },
    include: { members: true },
  });
  return NextResponse.json(group, { status: 201 });
}
