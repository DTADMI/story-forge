import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";

const MOCK_ENTRIES = [
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userId: "user_abc123",
    action: "project.create",
    entityType: "project",
    entityId: "proj_1",
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userId: "user_abc123",
    action: "user.update",
    entityType: "user",
    entityId: "user_abc123",
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userId: "user_def456",
    action: "project.delete",
    entityType: "project",
    entityId: "proj_2",
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userId: "admin",
    action: "admin.flag_update",
    entityType: null,
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    userId: "user_ghi789",
    action: "message.send",
    entityType: "message",
    entityId: "msg_1",
  },
];

const ACTION_COLORS: Record<string, string> = {
  "project.create": "bg-green-500/10 text-green-600",
  "project.delete": "bg-red-500/10 text-red-600",
  "user.update": "bg-blue-500/10 text-blue-600",
  "admin.flag_update": "bg-purple-500/10 text-purple-600",
  "message.send": "bg-amber-500/10 text-amber-600",
};

export default async function AdminAuditPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Audit Log</h1>
        <span className="text-xs text-fg/40 bg-fg/5 px-3 py-1 rounded-full">
          Audit log persistence coming in future update — showing mock data
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fg/10 text-left text-fg/50">
                <th className="p-3 font-medium">Timestamp</th>
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 font-medium">Entity</th>
                <th className="p-3 font-medium">User ID</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ENTRIES.map((entry, i) => (
                <tr key={i} className="border-b border-fg/5 hover:bg-fg/3">
                  <td className="p-3 text-fg/50 font-mono text-xs">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ACTION_COLORS[entry.action] || "bg-fg/10 text-fg"
                      }`}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="p-3 text-fg/50 text-xs">
                    {entry.entityType
                      ? `${entry.entityType}${entry.entityId ? ` / ${entry.entityId.slice(0, 12)}` : ""}`
                      : "—"}
                  </td>
                  <td className="p-3 text-fg/50 font-mono text-xs">{entry.userId.slice(0, 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-fg/30">
        The audit log currently shows placeholder entries. Once `auditLog` persistence is
        implemented (writing to `prisma.auditLog`), this page will display real data with filtering
        and search.
      </p>
    </div>
  );
}
