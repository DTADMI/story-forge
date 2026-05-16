import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { syncEventToNeo4j, syncEventCharacterLink } from "@/lib/neo4j-sync";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const events = await prisma.timelineEvent.findMany({
    where: { userId: user.id, projectId },
    orderBy: { date: "asc" },
    include: { characters: true, locations: true },
  });
  return NextResponse.json(events);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json();

  const schema = z.object({ title: z.string().min(1).max(300) }).passthrough();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.message },
      { status: 400 }
    );
  const { title, characterIds, locationIds, ...rest } = parsed.data;

  const event = await prisma.timelineEvent.create({
    data: {
      title,
      ...rest,
      userId: user.id,
      characters: characterIds
        ? { connect: characterIds.map((id: string) => ({ id })) }
        : undefined,
      locations: locationIds ? { connect: locationIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { characters: true, locations: true },
  });

  syncEventToNeo4j(event).catch(() => {});
  if (characterIds?.length) {
    for (const charId of characterIds) {
      syncEventCharacterLink(event.id, charId).catch(() => {});
    }
  }

  return NextResponse.json(event, { status: 201 });
});
