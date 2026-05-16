import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id } } }],
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  }
);

export const PATCH = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id } } }],
      },
      include: { collaborators: true },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = project.userId === user.id;
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.content !== undefined) data.content = body.content;
    if (body.defaultScope !== undefined) data.defaultScope = body.defaultScope;
    if (body.wordCount !== undefined) data.wordCount = body.wordCount;
    if (body.panelCount !== undefined) data.panelCount = body.panelCount;
    if (body.settings !== undefined && isOwner) data.settings = body.settings;

    const updated = await prisma.project.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  }
);

export const DELETE = withErrorHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id, role: "owner" } } }],
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.project.delete({ where: { id } });

    auditLog({
      userId: user.id,
      action: "project.delete",
      entityId: id,
      entityType: "project",
      metadata: { title: project.title },
    });

    return NextResponse.json({ success: true });
  }
);
