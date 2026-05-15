import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, bio: true, website: true, image: true, created_at: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireUser();
  const { id } = await params;
  if (currentUser.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();

  const profileData: Record<string, unknown> = {};
  if (body.name !== undefined) profileData.name = body.name;
  if (body.username !== undefined) profileData.username = body.username;
  if (body.bio !== undefined) profileData.bio = body.bio;
  if (body.website !== undefined) profileData.website = body.website;

  // Handle settings fields — merge with existing settings
  const settingsFields = ["defaultPublicationScope", "breakReminders", "writingCap", "preferences", "cadence", "quietHours", "channels"];
  const hasSettingsUpdate = settingsFields.some((f) => f in body);
  if (hasSettingsUpdate) {
    const existing = await prisma.user.findUnique({ where: { id }, select: { settings: true } });
    const currentSettings = (existing?.settings as Record<string, unknown>) ?? {};
    if (body.defaultPublicationScope !== undefined) currentSettings.defaultPublicationScope = body.defaultPublicationScope;
    if (body.breakReminders !== undefined) currentSettings.breakReminders = body.breakReminders;
    if (body.writingCap !== undefined) currentSettings.writingCap = body.writingCap;
    if (body.preferences) currentSettings.preferences = body.preferences;
    if (body.cadence) currentSettings.cadence = body.cadence;
    if (body.quietHours) currentSettings.quietHours = body.quietHours;
    if (body.channels) currentSettings.channels = body.channels;
    profileData.settings = currentSettings;
  }

  const user = await prisma.user.update({
    where: { id },
    data: profileData,
  });

  auditLog({
    userId: currentUser.id,
    action: "user.update",
    entityId: id,
    entityType: "user",
    metadata: { fields: Object.keys(body) },
  });

  return NextResponse.json(user);
}
