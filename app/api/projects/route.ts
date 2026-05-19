import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createActivityAsync } from "@/lib/activity";
import { auditLog } from "@/lib/audit";
import { canCreateProject } from "@/lib/permissions";
import { forbidden } from "@/lib/error-response";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async () => {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      subscriptionTier: true,
      role: true,
      _count: { select: { projects: true, characters: true } },
    },
  });

  if (dbUser && !canCreateProject(dbUser)) {
    return forbidden(
      "Project limit reached for your subscription tier. Upgrade to create more projects."
    );
  }

  const project = await prisma.project.create({
    data: {
      title: body.title || "Untitled",
      description: body.description,
      defaultScope: body.defaultScope || "PRIVATE",
      userId: user.id,
    },
  });

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
});
