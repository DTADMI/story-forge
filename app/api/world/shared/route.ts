import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type SharableModel =
  | "character"
  | "location"
  | "timelineEvent"
  | "timelineevent"
  | "organization"
  | "species";

function getModel(modelName: SharableModel) {
  switch (modelName) {
    case "character":
      return prisma.character;
    case "location":
      return prisma.location;
    case "timelineEvent":
    case "timelineevent":
      return prisma.timelineEvent;
    case "organization":
      return prisma.organization;
    case "species":
      return prisma.species;
  }
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as SharableModel | null;

  if (type) {
    const model = getModel(type);
    const entities = await (
      model as unknown as { findMany(args: Record<string, unknown>): Promise<unknown[]> }
    ).findMany({
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

  const model = getModel(entityType as SharableModel);
  if (!model) {
    return NextResponse.json({ error: `Invalid entityType: ${entityType}` }, { status: 400 });
  }

  interface SharedEntity {
    id: string;
    createdAt: unknown;
    updatedAt: unknown;
    isShared: unknown;
    sharedFromProjectId: unknown;
    userId: unknown;
    projectId: unknown;
    [key: string]: unknown;
  }

  type SharedModelOps = {
    findUnique(args: { where: { id: string } }): Promise<SharedEntity | null>;
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
  };

  const source = await (model as unknown as SharedModelOps).findUnique({ where: { id: entityId } });
  if (!source) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const excludeKeys = new Set(["id", "createdAt", "updatedAt", "isShared", "sharedFromProjectId"]);
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (!excludeKeys.has(key)) {
      data[key] = source[key];
    }
  }

  const copy = await (model as unknown as SharedModelOps).create({
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
