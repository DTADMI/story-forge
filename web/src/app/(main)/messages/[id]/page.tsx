import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { MessageThread } from "./message-thread";
import Link from "next/link";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;

  const partner = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, image: true },
  });
  if (!partner) notFound();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: id },
        { senderId: id, receiverId: user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
      receiver: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const serialized = messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    read: m.read,
    senderId: m.senderId,
    receiverId: m.receiverId,
    sender: m.sender,
    receiver: m.receiver,
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link href="/messages" className="text-sm text-fg/40 hover:text-brand">
          Back
        </Link>
        <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand">
          {partner.image ? (
            <img
              src={partner.image}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            (partner.username || partner.name || "?").charAt(0).toUpperCase()
          )}
        </div>
        <h1 className="font-bold">{partner.username || partner.name || "Unknown"}</h1>
      </div>

      <MessageThread
        initialMessages={serialized}
        currentUserId={user.id}
        partnerId={id}
        partnerName={partner.username || partner.name || "Unknown"}
      />
    </main>
  );
}
