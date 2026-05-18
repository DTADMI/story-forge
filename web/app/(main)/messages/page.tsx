import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

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
      partner: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
      };
      lastContent: string;
      lastTimestamp: string;
      lastSenderId: string;
      unreadCount: number;
    }
  >();

  for (const msg of messages) {
    const partner = msg.senderId === user.id ? msg.receiver : msg.sender;
    const existing = conversationMap.get(partner.id);

    if (!existing) {
      conversationMap.set(partner.id, {
        partner,
        lastContent: msg.content,
        lastTimestamp: msg.createdAt.toISOString(),
        lastSenderId: msg.senderId,
        unreadCount: msg.receiverId === user.id && !msg.read ? 1 : 0,
      });
    } else if (msg.receiverId === user.id && !msg.read) {
      existing.unreadCount += 1;
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-6 w-6 text-fg/30" />}
          title="No messages yet"
          description="Start a conversation with another writer."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={conv.partner.id} href={`/messages/${conv.partner.id}`}>
              <Card className="p-4 hover:bg-fg/5 transition-colors cursor-pointer flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  {conv.partner.image ? (
                    <img
                      src={conv.partner.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    (conv.partner.username || conv.partner.name || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">
                      {conv.partner.username || conv.partner.name || "Unknown"}
                    </span>
                    <span className="text-xs text-fg/40 shrink-0 ml-2">
                      {formatTime(conv.lastTimestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-fg/50 truncate mt-0.5">
                    {conv.lastSenderId === user.id ? "You: " : ""}
                    {conv.lastContent}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-brand text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                    {conv.unreadCount}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d`;
  return date.toLocaleDateString();
}
