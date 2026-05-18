import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { JoinLeaveButton } from "./join-leave-button";
import Link from "next/link";
import { ArrowLeft, Shield, User } from "lucide-react";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!group) notFound();

  const isMember = group.members.some((m) => m.userId === user.id);
  const isAdmin = group.members.some((m) => m.userId === user.id && m.role === "admin");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/groups"
        className="inline-flex items-center gap-1 text-sm text-fg/40 hover:text-brand mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Groups
      </Link>

      <Card className="p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">{group.name}</h1>
            {group.description && <p className="text-fg/60 mt-2">{group.description}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-fg/40">
              <span>
                {group.members.length} member{group.members.length !== 1 ? "s" : ""}
              </span>
              {group.isPrivate && (
                <span className="border border-fg/20 rounded px-1.5 py-0.5">Private</span>
              )}
            </div>
          </div>
          <JoinLeaveButton groupId={group.id} isMember={isMember} isPrivate={group.isPrivate} />
        </div>
      </Card>

      <h2 className="text-lg font-bold mb-4">Members</h2>
      <div className="space-y-2">
        {group.members.map((member) => (
          <Card key={member.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fg/10">
                <User className="h-4 w-4 text-fg/40" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {member.user.name || member.user.username || "Anonymous"}
                </p>
                {member.user.username && (
                  <p className="text-xs text-fg/40">@{member.user.username}</p>
                )}
              </div>
            </div>
            {member.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-xs text-brand">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
