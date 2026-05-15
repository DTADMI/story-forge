import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id: projectId } = await params;
  const body: { value: 1 | -1 } = await request.json();

  if (body.value !== 1 && body.value !== -1) {
    return NextResponse.json({ error: "value must be 1 or -1" }, { status: 400 });
  }

  await prisma.projectVote.upsert({
    where: { userId_projectId: { userId: user.id, projectId } },
    update: { value: body.value },
    create: { userId: user.id, projectId, value: body.value },
  });

  const tally = await prisma.projectVote.aggregate({
    where: { projectId },
    _sum: { value: true },
  });

  return NextResponse.json({ vote: body.value, tally: tally._sum.value ?? 0 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const [userVote, tally] = await Promise.all([
    prisma.projectVote.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
      select: { value: true },
    }),
    prisma.projectVote.aggregate({
      where: { projectId },
      _sum: { value: true },
    }),
  ]);

  return NextResponse.json({
    userVote: userVote?.value ?? null,
    tally: tally._sum.value ?? 0,
  });
}
