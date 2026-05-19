import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { z } from "zod";

const createNotificationSchema = z.object({
  type: z.enum(["comment", "cheer", "follow", "badge", "message", "group_invite"]),
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().max(1000).optional(),
  entityId: z.string().optional(),
  entityType: z.string().optional(),
});

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

  const parsed = createNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", detail: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body || null,
      entityId: parsed.data.entityId || null,
      entityType: parsed.data.entityType || null,
    },
  });

  return NextResponse.json(notification, { status: 201 });
});
