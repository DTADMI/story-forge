import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async () => {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json();
  const { type, title, body: bodyText, entityId, entityType } = body;

  if (!type || !title) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const validTypes = ["comment", "cheer", "follow", "badge", "message", "group_invite"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      type,
      title,
      body: bodyText || null,
      entityId: entityId || null,
      entityType: entityType || null,
    },
  });

  return NextResponse.json(notification, { status: 201 });
});
