import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminModerationPage() {
  await requireAdmin();

  const [projectCount, recentProjects] = await Promise.all([
    prisma.project.count(),
    prisma.project.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, username: true } } },
    }),
  ]);

  const [characterCount, recentCharacters] = await Promise.all([
    prisma.character.count(),
    prisma.character.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, username: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Moderation</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{projectCount}</p>
          <p className="text-xs text-fg/50">Projects to review</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{characterCount}</p>
          <p className="text-xs text-fg/50">Characters to review</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="font-bold mb-3">Latest Projects</h2>
          <div className="space-y-2">
            {recentProjects.map((p) => (
              <div key={p.id} className="flex justify-between text-sm py-1 border-b border-fg/5">
                <div>
                  <span className="truncate block max-w-[200px]">{p.title}</span>
                  <span className="text-xs text-fg/40">{p.user?.username || "—"}</span>
                </div>
                <Link
                  href={`/admin/moderation/${p.id}`}
                  className="text-xs text-brand hover:underline shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-bold mb-3">Latest Characters</h2>
          <div className="space-y-2">
            {recentCharacters.map((c) => (
              <div key={c.id} className="flex justify-between text-sm py-1 border-b border-fg/5">
                <div>
                  <span className="truncate block max-w-[200px]">{c.name}</span>
                  <span className="text-xs text-fg/40">{c.user?.username || "—"}</span>
                </div>
                <Link
                  href={`/admin/moderation/${c.id}`}
                  className="text-xs text-brand hover:underline shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
