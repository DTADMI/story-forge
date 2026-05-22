import { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Eras — StoryForge" };

export default async function ErasPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const user = await getUser();
  if (!user) return null;
  const { projectId } = await searchParams;

  const eras = await prisma.era.findMany({
    where: { userId: user.id, projectId: projectId || undefined },
    orderBy: { sortOrder: "asc" },
    include: { project: { select: { id: true, title: true } } },
  });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eras</h1>
          <p className="text-muted-foreground">Periods and ages in your world&apos;s timeline.</p>
        </div>
        <Button>
          <Link href="/world/era/new">New Era</Link>
        </Button>
      </div>

      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button variant={!projectId ? "default" : "outline"} size="sm">
            <Link href="/world/era">All Projects</Link>
          </Button>
          {projects.map((p) => (
            <Button key={p.id} variant={projectId === p.id ? "default" : "outline"} size="sm">
              <Link href={`/world/era?projectId=${p.id}`}>{p.title}</Link>
            </Button>
          ))}
        </div>
      )}

      {eras.length === 0 ? (
        <EmptyState
          title="No eras yet"
          description="Create eras to organize your timeline into distinct periods."
          action={{ label: "Create Era", href: "/world/era/new" }}
        />
      ) : (
        <div className="space-y-3">
          {eras.map((era) => (
            <Card key={era.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <Link
                    href={`/world/era/${era.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {era.name}
                  </Link>
                  {era.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{era.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {era.startDate && <span>From: {era.startDate}</span>}
                    {era.endDate && <span>To: {era.endDate}</span>}
                    {era.project && <span>Project: {era.project.title}</span>}
                  </div>
                </div>
                {era.color && (
                  <div
                    className="h-6 w-6 rounded-full shrink-0"
                    style={{ backgroundColor: era.color }}
                    aria-label={`Color: ${era.color}`}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
