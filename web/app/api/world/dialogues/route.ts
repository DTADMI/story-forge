import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const dialogues = await prisma.dialogue.findMany({
    where: { userId: user.id, projectId },
    orderBy: { createdAt: "desc" },
    include: { project: true },
  });
  return NextResponse.json(dialogues);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();

  const schema = z.object({ title: z.string().optional(), content: z.any() }).passthrough();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.message },
      { status: 400 }
    );
  const { title, content, ...rest } = parsed.data;

  const dialogue = await prisma.dialogue.create({
    data: { title, content, ...rest, userId: user.id },
  });
  return NextResponse.json(dialogue, { status: 201 });
}
