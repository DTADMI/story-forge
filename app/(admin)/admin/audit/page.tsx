import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const ACTION_COLORS: Record<string, string> = {
  "project.create": "bg-green-500/10 text-green-600",
  "project.delete": "bg-red-500/10 text-red-600",
  "project.publish": "bg-green-500/10 text-green-600",
  "user.update": "bg-blue-500/10 text-blue-600",
  "user.signup": "bg-blue-500/10 text-blue-600",
  "admin.flag_update": "bg-purple-500/10 text-purple-600",
  "message.send": "bg-amber-500/10 text-amber-600",
  "billing.checkout": "bg-emerald-500/10 text-emerald-600",
  "billing.webhook": "bg-emerald-500/10 text-emerald-600",
  "comment.create": "bg-cyan-500/10 text-cyan-600",
  "comment.delete": "bg-red-500/10 text-red-600",
  "follow.create": "bg-pink-500/10 text-pink-600",
  "group.create": "bg-violet-500/10 text-violet-600",
  "badge.earned": "bg-yellow-500/10 text-yellow-600",
  "goal.complete": "bg-green-500/10 text-green-600",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  await requireAdmin();
  const { action: filterAction, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const perPage = 50;

  const where = filterAction ? { action: filterAction } : {};

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const uniqueActions = [
    ...new Set(
      (
        await prisma.auditEvent.findMany({
          select: { action: true },
          distinct: ["action"],
          take: 50,
        })
      ).map((e) => e.action)
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Audit Log</h1>
          <p className="text-sm text-fg/40 mt-1">
            {total} event{total !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      {uniqueActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/audit"
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              !filterAction ? "bg-brand text-white" : "bg-fg/5 text-fg/50 hover:bg-fg/10"
            }`}
          >
            All
          </a>
          {uniqueActions.map((action) => (
            <a
              key={action}
              href={`/admin/audit?action=${encodeURIComponent(action)}`}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                filterAction === action
                  ? "bg-brand text-white"
                  : "bg-fg/5 text-fg/50 hover:bg-fg/10"
              }`}
            >
              {action}
            </a>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-fg/40">No audit events recorded yet.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fg/10 text-left text-fg/50">
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Action</th>
                  <th className="p-3 font-medium">Entity</th>
                  <th className="p-3 font-medium">User ID</th>
                  <th className="p-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-fg/5 hover:bg-fg/3">
                    <td className="p-3 text-fg/50 font-mono text-xs">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          ACTION_COLORS[event.action] || "bg-fg/10 text-fg"
                        }`}
                      >
                        {event.action}
                      </span>
                    </td>
                    <td className="p-3 text-fg/50 text-xs">
                      {event.entityType
                        ? `${event.entityType}${event.entityId ? ` / ${event.entityId.slice(0, 12)}` : ""}`
                        : "—"}
                    </td>
                    <td className="p-3 text-fg/50 font-mono text-xs">
                      {event.userId.slice(0, 12)}
                    </td>
                    <td className="p-3 text-fg/50 font-mono text-xs">{event.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/audit?page=${p}${filterAction ? `&action=${encodeURIComponent(filterAction)}` : ""}`}
              className={`text-xs px-3 py-1 rounded font-medium ${
                p === page ? "bg-brand text-white" : "bg-fg/5 text-fg/50 hover:bg-fg/10"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
