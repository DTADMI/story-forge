import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: { take: 10, orderBy: { updatedAt: "desc" } },
      characters: { take: 10, orderBy: { updatedAt: "desc" } },
      inkPot: true,
      _count: {
        select: {
          projects: true,
          characters: true,
          locations: true,
          timelineEvents: true,
          dialogues: true,
          goals: true,
          followers: true,
          following: true,
          groups: true,
        },
      },
    },
  });

  if (!user) notFound();

  const badgeCount = await prisma.userBadge.count({ where: { userId: id } });
  const settings = (user.settings as Record<string, unknown>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-fg/40 hover:text-brand">
          ← Users
        </Link>
        <h1 className="text-2xl font-extrabold">
          {user.username || user.name || user.id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-3">
          <h2 className="font-bold">Profile</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Name" value={user.name} />
            <Detail label="Username" value={user.username} />
            <Detail label="Email" value={user.email} />
            <Detail label="Website" value={user.website} />
            <Detail label="Bio" value={user.bio?.slice(0, 100)} />
            <Detail label="Subscription" value={user.subscriptionStatus || "free"} />
            <Detail label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-bold">Stats</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Projects" value={String(user._count.projects)} />
            <Detail label="Characters" value={String(user._count.characters)} />
            <Detail label="Locations" value={String(user._count.locations)} />
            <Detail label="Timeline Events" value={String(user._count.timelineEvents)} />
            <Detail label="Dialogues" value={String(user._count.dialogues)} />
            <Detail label="Goals" value={String(user._count.goals)} />
            <Detail label="Badges" value={String(badgeCount)} />
            <Detail label="Ink Balance" value={String(user.inkPot?.balance ?? 0)} />
            <Detail label="Followers" value={String(user._count.followers)} />
            <Detail label="Following" value={String(user._count.following)} />
            <Detail label="Groups" value={String(user._count.groups)} />
          </div>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="font-bold">Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Detail label="Admin" value={settings.is_admin ? "Yes" : "No"} />
          <Detail label="Moderator" value={settings.is_moderator ? "Yes" : "No"} />
          <Detail label="Break Reminders" value={settings.breakReminders ? "On" : "Off"} />
          <Detail
            label="Writing Cap"
            value={settings.writingCap ? String(settings.writingCap) : "None"}
          />
        </div>
      </Card>

      {user.projects.length > 0 && (
        <Card className="p-4 space-y-2">
          <h2 className="font-bold">Recent Projects</h2>
          {user.projects.map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span>{p.title}</span>
              <span className="text-fg/40">{p.wordCount} words</span>
            </div>
          ))}
        </Card>
      )}

      {user.characters.length > 0 && (
        <Card className="p-4 space-y-2">
          <h2 className="font-bold">Recent Characters</h2>
          {user.characters.map((c) => (
            <div key={c.id} className="text-sm">
              {c.name}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-fg/40">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
