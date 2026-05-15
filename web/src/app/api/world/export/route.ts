import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const user = await requireUser();

  const [
    characters,
    locations,
    organizations,
    species,
    timeline,
    dialogues,
    encyclopedia,
    calendar,
    eras,
  ] = await Promise.all([
    prisma.character.findMany({ where: { userId: user.id } }),
    prisma.location.findMany({ where: { userId: user.id } }),
    prisma.organization.findMany({ where: { userId: user.id } }),
    prisma.species.findMany({ where: { userId: user.id } }),
    prisma.timelineEvent.findMany({
      where: { userId: user.id },
      include: { characters: true, locations: true },
    }),
    prisma.dialogue.findMany({ where: { userId: user.id } }),
    prisma.encyclopediaEntry.findMany({ where: { userId: user.id } }),
    prisma.calendar.findMany({
      where: { userId: user.id },
      include: { months: { orderBy: { orderIndex: "asc" } } },
    }),
    prisma.era.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    characters,
    locations,
    organizations,
    species,
    timeline,
    dialogues,
    encyclopedia,
    calendar,
    eras,
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="storyforge-export-${Date.now()}.json"`,
    },
  });
}
