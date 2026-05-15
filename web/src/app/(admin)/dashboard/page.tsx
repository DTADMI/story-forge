import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ResyncGraphButton } from "./resync-button";

export default async function AdminDashboardPage() {
  const [userCount, projectCount, characterCount, groupCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.character.count(),
    prisma.group.count(),
  ]);

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Projects", value: projectCount },
    { label: "Characters", value: characterCount },
    { label: "Groups", value: groupCount },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
        <ResyncGraphButton />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-fg/50 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold mb-3">Recent Projects</h2>
          <ProjectList />
        </Card>
        <Card className="p-6">
          <h2 className="font-bold mb-3">Recent Users</h2>
          <UserList />
        </Card>
      </div>
    </div>
  );
}

async function ProjectList() {
  const projects = await prisma.project.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, username: true } } },
  });
  return (
    <div className="space-y-2">
      {projects.map((p) => (
        <div key={p.id} className="flex justify-between text-sm">
          <span className="truncate">{p.title}</span>
          <span className="text-fg/40 shrink-0 ml-2">
            {p.user?.username || p.user?.name || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

async function UserList() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    select: { id: true, name: true, username: true, created_at: true },
  });
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex justify-between text-sm">
          <Link href={`/admin/users/${u.id}`} className="hover:text-brand truncate">
            {u.username || u.name || u.id.slice(0, 8)}
          </Link>
          <span className="text-fg/40 shrink-0 ml-2">
            {new Date(u.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
