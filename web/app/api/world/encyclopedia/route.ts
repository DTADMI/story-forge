import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const projectId = searchParams.get("projectId") || undefined;

  const where: Record<string, unknown> = { userId: user.id };
  if (category) where.category = category;
  if (projectId) where.projectId = projectId;

  const entries = await prisma.encyclopediaEntry.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();

  if (!body.category || !body.title || !body.content) {
    return NextResponse.json(
      { error: "category, title, and content are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.encyclopediaEntry.create({
    data: {
      category: body.category,
      title: body.title,
      content: body.content,
      projectId: body.projectId || null,
      userId: user.id,
      metadata: body.metadata,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
