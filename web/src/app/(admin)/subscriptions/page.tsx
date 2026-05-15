import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { SUBSCRIPTION_LIMITS } from "@/lib/permissions";

export default async function AdminSubscriptionsPage() {
  const supabaseUser = await getUser();
  if (!supabaseUser) redirect("/signin");

  const dbUser = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "admin") redirect("/signin");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
      role: true,
      _count: { select: { projects: true, characters: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Subscription Management</h1>
        <p className="text-fg/60 mt-1">
          View and manage user subscription tiers, status, and usage.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fg/10 text-left text-fg/50">
              <th className="py-2 pr-4 font-medium">User</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 pr-4 font-medium">Tier</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Projects</th>
              <th className="py-2 pr-4 font-medium">Characters</th>
              <th className="py-2 pr-4 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const limits =
                SUBSCRIPTION_LIMITS[u.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS] ??
                SUBSCRIPTION_LIMITS.free;
              return (
                <tr key={u.id} className="border-b border-fg/5 hover:bg-fg/[0.02]">
                  <td className="py-2 pr-4">
                    <div>
                      <p className="font-medium">{u.name || "Unnamed"}</p>
                      <p className="text-xs text-fg/40">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-fg/10 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                        u.subscriptionTier === "lifetime"
                          ? "bg-purple-500/10 text-purple-500"
                          : u.subscriptionTier === "creator"
                            ? "bg-brand/10 text-brand"
                            : u.subscriptionTier === "explorer"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-fg/10 text-fg/50"
                      }`}
                    >
                      {u.subscriptionTier}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                        u.subscriptionStatus === "active"
                          ? "bg-green-500/10 text-green-500"
                          : u.subscriptionStatus === "past_due"
                            ? "bg-red-500/10 text-red-500"
                            : u.subscriptionStatus === "trialing"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-fg/10 text-fg/50"
                      }`}
                    >
                      {u.subscriptionStatus || "N/A"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-fg/60">
                    {u._count.projects} / {limits.maxProjects === -1 ? "∞" : limits.maxProjects}
                  </td>
                  <td className="py-2 pr-4 text-fg/60">
                    {u._count.characters} /{" "}
                    {limits.maxCharacters === -1 ? "∞" : limits.maxCharacters}
                  </td>
                  <td className="py-2 pr-4 text-xs text-fg/40">
                    {u.subscriptionExpiresAt
                      ? new Date(u.subscriptionExpiresAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <Card className="p-6 text-center text-sm text-fg/40">No users found.</Card>
      )}
    </main>
  );
}
