import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/flags-server";
import { notFound } from "@/lib/error-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEnabled("version_history"))) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  }
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) return notFound("Project not found");

  // Auto-save disabled in GET to avoid write side-effects.
  // The editor's autosave-indicator handles saving.
  // To force a save, POST to this endpoint with { versionId }.

  const versions = await prisma.projectVersion.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, wordCount: true, label: true, createdAt: true },
  });

  return NextResponse.json(versions);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEnabled("version_history"))) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  }
  const user = await requireUser();
  const { id } = await params;
  const { versionId } = await request.json();

  const [project, version] = await Promise.all([
    prisma.project.findFirst({ where: { id, userId: user.id } }),
    prisma.projectVersion.findFirst({ where: { id: versionId, projectId: id } }),
  ]);

  if (!project || !version) return notFound();

  // Restore version content
  await prisma.project.update({
    where: { id },
    data: {
      content: version.content,
      wordCount: version.wordCount,
    },
  });

  return NextResponse.json({ restored: true, wordCount: version.wordCount });
}
