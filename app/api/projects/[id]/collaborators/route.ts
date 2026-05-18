import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id } } }],
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId: id },
    include: {
      user: { select: { id: true, name: true, username: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(collaborators);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found or not owner" }, { status: 403 });

  const body = await request.json();
  const { userId, role = "editor" } = body;

  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  if (!["owner", "editor", "viewer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
  });
  if (existing) {
    const updated = await prisma.projectCollaborator.update({
      where: { id: existing.id },
      data: { role },
      include: {
        user: { select: { id: true, name: true, username: true, email: true, image: true } },
      },
    });
    return NextResponse.json(updated);
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId: id, userId, role },
    include: {
      user: { select: { id: true, name: true, username: true, email: true, image: true } },
    },
  });

  return NextResponse.json(collaborator, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found or not owner" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId query param required" }, { status: 400 });

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.projectCollaborator.delete({ where: { id: existing.id } });

  return NextResponse.json({ success: true });
}
