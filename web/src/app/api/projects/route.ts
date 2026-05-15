import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createActivityAsync } from "@/lib/activity";
import { auditLog } from "@/lib/audit";

export async function GET() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      title: body.title || "Untitled",
      description: body.description,
      defaultScope: body.defaultScope || "PRIVATE",
      userId: user.id,
    },
  });

  // Fire-and-forget activity
  createActivityAsync({
    userId: user.id,
    type: "project_created",
    entityId: project.id,
    entityType: "project",
    metadata: { title: project.title, wordCount: 0 },
  });

  auditLog({
    userId: user.id,
    action: "project.create",
    entityId: project.id,
    entityType: "project",
    metadata: { title: project.title },
  });

  return NextResponse.json(project, { status: 201 });
}
