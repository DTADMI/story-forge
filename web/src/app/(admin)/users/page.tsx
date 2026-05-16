import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      subscription_status: true,
      created_at: true,
      _count: { select: { projects: true, characters: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fg/10 text-left text-fg/50">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Role/Status</th>
                <th className="p-3 font-medium">Projects</th>
                <th className="p-3 font-medium">Characters</th>
                <th className="p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-fg/5 hover:bg-fg/3">
                  <td className="p-3">
                    <div className="font-medium">{u.username || u.name || "—"}</div>
                    <div className="text-xs text-fg/40">{u.email || u.id.slice(0, 12)}</div>
                  </td>
                  <td className="p-3">
                    {u.subscription_status ? (
                      <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                        {u.subscription_status}
                      </span>
                    ) : (
                      <span className="text-xs text-fg/40">free</span>
                    )}
                  </td>
                  <td className="p-3">{u._count.projects}</td>
                  <td className="p-3">{u._count.characters}</td>
                  <td className="p-3 text-fg/40">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
