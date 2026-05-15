import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6 text-fg/30" />}
          title="No notifications"
          description="You're all caught up."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-colors ${!n.read ? "border-l-2 border-l-brand bg-brand/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${!n.read ? "text-fg" : "text-fg/60"}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className={`text-xs mt-1 ${!n.read ? "text-fg/60" : "text-fg/40"}`}>
                      {n.body}
                    </p>
                  )}
                  <p className="text-xs text-fg/30 mt-2 flex items-center gap-2">
                    <span className="capitalize">{n.type.replace(/_/g, " ")}</span>
                    <span>·</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
                {!n.read && (
                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-brand mt-1.5" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
