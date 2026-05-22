import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { content } = await request.json();

  if (!content || String(content).trim().length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const comment = await prisma.comment.findFirst({
    where: { id, userId: user.id },
  });

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content: String(content).trim().slice(0, 2000) },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const comment = await prisma.comment.findFirst({
    where: { id, userId: user.id },
  });
  if (!comment) {
    // Check if user is the project author (can delete any comment on their project)
    const project = await prisma.project.findFirst({
      where: { comments: { some: { id } }, userId: user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
