import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id: competitionId } = await params;
  const body: { projectId: string } = await request.json();

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });
  if (competition.status !== "active" && competition.status !== "upcoming") {
    return NextResponse.json({ error: "Competition is not accepting entries" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: body.projectId, userId: user.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (!project.isPublic) {
    return NextResponse.json({ error: "Project must be public to enter" }, { status: 400 });
  }
  if (project.wordCount < competition.minWords) {
    return NextResponse.json(
      {
        error: `Project word count (${project.wordCount}) is below minimum (${competition.minWords})`,
      },
      { status: 400 }
    );
  }
  if (competition.maxWords && project.wordCount > competition.maxWords) {
    return NextResponse.json(
      {
        error: `Project word count (${project.wordCount}) exceeds maximum (${competition.maxWords})`,
      },
      { status: 400 }
    );
  }

  const existing = await prisma.competitionEntry.findUnique({
    where: { competitionId_projectId: { competitionId, projectId: body.projectId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Project already entered" }, { status: 409 });
  }

  const entry = await prisma.competitionEntry.create({
    data: {
      competitionId,
      projectId: body.projectId,
      userId: user.id,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
