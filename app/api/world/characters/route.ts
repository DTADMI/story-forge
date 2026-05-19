import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { canCreateCharacter } from "@/lib/permissions";
import { forbidden } from "@/lib/error-response";
import { syncCharacterToNeo4j } from "@/lib/neo4j-sync";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const characters = await prisma.character.findMany({
    where: { userId: user.id, projectId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(characters);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json();

  const schema = z.object({ name: z.string().min(1).max(200) }).passthrough();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.message },
      { status: 400 }
    );
  const { name, ...rest } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      subscriptionTier: true,
      role: true,
      _count: { select: { projects: true, characters: true } },
    },
  });

  if (dbUser && !canCreateCharacter(dbUser)) {
    return forbidden(
      "Character limit reached for your subscription tier. Upgrade to create more characters."
    );
  }

  const character = await prisma.character.create({
    data: { name, ...rest, userId: user.id },
  });
  syncCharacterToNeo4j(character).catch(() => {});
  return NextResponse.json(character, { status: 201 });
});
