import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { Users, Plus } from "lucide-react";

export default async function GroupsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const groups = await prisma.group.findMany({
    where: {
      OR: [{ isPrivate: false }, { members: { some: { userId: user.id } } }],
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Groups</h1>
          <p className="text-fg/60 mt-1">Join writing circles and collaborate with others.</p>
        </div>
        <Link
          href="/groups/new"
          className="bg-brand text-white inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          New Group
        </Link>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-fg/30" />}
          title="No groups yet"
          description="Create a group to start collaborating with other writers."
          action={{ label: "Create Group", href: "/groups/new" }}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="p-4 hover:border-brand/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-fg/60 mt-0.5 line-clamp-1">{group.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-fg/40 shrink-0">
                    {group.isPrivate && (
                      <span className="border border-fg/20 rounded px-1.5 py-0.5">Private</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {group.members.length}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
