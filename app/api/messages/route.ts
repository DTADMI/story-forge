import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, validationError, notFound } from "@/lib/error-response";
import { auditLog } from "@/lib/audit";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const withUser = searchParams.get("with");

  if (withUser) {
    const thread = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: withUser },
          { senderId: withUser, receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        receiver: { select: { id: true, name: true, username: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(thread);
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
      receiver: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversationMap = new Map<
    string,
    {
      partner: { id: string; name: string | null; username: string | null; image: string | null };
      lastMessage: { content: string; createdAt: string; senderId: string };
      unreadCount: number;
    }
  >();

  for (const msg of messages) {
    const partner = msg.senderId === user.id ? msg.receiver : msg.sender;
    const existing = conversationMap.get(partner.id);

    if (!existing) {
      conversationMap.set(partner.id, {
        partner,
        lastMessage: {
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
          senderId: msg.senderId,
        },
        unreadCount: msg.receiverId === user.id && !msg.read ? 1 : 0,
      });
    } else if (msg.receiverId === user.id && !msg.read) {
      existing.unreadCount += 1;
    }
  }

  const conversations = Array.from(conversationMap.values());
  return NextResponse.json(conversations);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  if (!body) return validationError("Invalid JSON body");

  const { receiverId, content } = body;
  if (!receiverId || !content) return validationError("receiverId and content are required");
  if (receiverId === user.id) return validationError("Cannot message yourself");

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return notFound("Receiver not found");

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content,
    },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
      receiver: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "new_message",
      title: `New message from ${user.email || "a user"}`,
      body: content.length > 100 ? content.slice(0, 97) + "..." : content,
      entityId: message.id,
    },
  });

  auditLog({
    userId: user.id,
    action: "message.send",
    entityId: message.id,
    entityType: "message",
    metadata: { receiverId },
  });

  return NextResponse.json(message, { status: 201 });
});
