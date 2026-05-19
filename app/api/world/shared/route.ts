import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const SHARABLE_MODELS = {
  character: prisma.character,
  location: prisma.location,
  timelineEvent: prisma.timelineEvent,
  timelineevent: prisma.timelineEvent,
  organization: prisma.organization,
  species: prisma.species,
} as const;

type SharableModel = keyof typeof SHARABLE_MODELS;

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as SharableModel | null;

  if (type && SHARABLE_MODELS[type]) {
    const model = SHARABLE_MODELS[type];
    const entities = await (model as any).findMany({
      where: { isShared: true, userId: { not: user.id } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(entities);
  }

  const [characters, locations, timelineEvents, organizations, species] = await Promise.all([
    prisma.character.findMany({
      where: { isShared: true, userId: { not: user.id } },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { isShared: true, userId: { not: user.id } },
      orderBy: { name: "asc" },
    }),
    prisma.timelineEvent.findMany({
      where: { isShared: true, userId: { not: user.id } },
      orderBy: { title: "asc" },
    }),
    prisma.organization.findMany({
      where: { isShared: true, userId: { not: user.id } },
      orderBy: { name: "asc" },
    }),
    prisma.species.findMany({
      where: { isShared: true, userId: { not: user.id } },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    characters,
    locations,
    timelineEvents,
    organizations,
    species,
  });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const body = await request.json();
  const { entityType, entityId, targetProjectId } = body;

  if (!entityType || !entityId || !targetProjectId) {
    return NextResponse.json(
      { error: "entityType, entityId, and targetProjectId are required" },
      { status: 400 }
    );
  }

  const model = SHARABLE_MODELS[entityType as SharableModel];
  if (!model) {
    return NextResponse.json({ error: `Invalid entityType: ${entityType}` }, { status: 400 });
  }

  const source = await (model as any).findUnique({ where: { id: entityId } });
  if (!source) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _c, updatedAt: _u, isShared: _, sharedFromProjectId: __, ...data } = source;

  const copy = await (model as any).create({
    data: {
      ...data,
      userId: user.id,
      projectId: targetProjectId,
      sharedFromProjectId: source.projectId || null,
      isShared: false,
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
