import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const entry = await prisma.encyclopediaEntry.findFirst({
    where: { id, userId: user.id },
  });

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const body = await request.json();
  const entry = await prisma.encyclopediaEntry.update({
    where: { id, userId: user.id },
    data: {
      title: body.title,
      content: body.content,
      category: body.category,
      projectId: body.projectId,
      metadata: body.metadata,
      imageUrl: body.imageUrl,
      references: body.references,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  await prisma.encyclopediaEntry.delete({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ deleted: true });
}
