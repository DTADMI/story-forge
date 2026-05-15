import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
