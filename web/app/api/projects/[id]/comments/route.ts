import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { projectId: id, parentId: null },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { content, parentId } = await request.json();

  if (!content || String(content).trim().length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      projectId: id,
      userId: user.id,
      content: String(content).trim().slice(0, 2000),
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  // Create activity for the project author
  const project = await prisma.project.findUnique({
    where: { id },
    select: { userId: true, title: true },
  });
  if (project && project.userId !== user.id) {
    await prisma.activity.create({
      data: {
        userId: project.userId,
        type: "comment_received",
        entityId: id,
        entityType: "project",
        metadata: { projectTitle: project.title, commenterName: user.email || "A reader" },
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
