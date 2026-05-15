import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/error-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) return notFound("Project not found");

  // Auto-save current version if content changed
  const lastVersion = await prisma.projectVersion.findFirst({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  if (project.content && (!lastVersion || lastVersion.content !== project.content)) {
    await prisma.projectVersion.create({
      data: {
        projectId: id,
        content: project.content,
        wordCount: project.wordCount,
        label: `Auto-saved ${new Date().toLocaleDateString()}`,
      },
    });
  }

  const versions = await prisma.projectVersion.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, wordCount: true, label: true, createdAt: true },
  });

  return NextResponse.json(versions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
