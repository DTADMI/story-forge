import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Locations — StoryForge" };

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const user = await getUser();
  if (!user) return null;
  const { projectId } = await searchParams;

  const locations = await prisma.location.findMany({
    where: { userId: user.id, projectId: projectId || undefined },
    orderBy: { updatedAt: "desc" },
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
          <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Map out the places that shape your world.</p>
        </div>
        <Button asChild>
          <Link href="/world/locations/new">New Location</Link>
        </Button>
      </div>

      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button variant={!projectId ? "primary" : "outline"} size="sm" asChild>
            <Link href="/world/locations">All Projects</Link>
          </Button>
          {projects.map((p) => (
            <Button
              key={p.id}
              variant={projectId === p.id ? "primary" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/world/locations?projectId=${p.id}`}>{p.title}</Link>
            </Button>
          ))}
        </div>
      )}

      {locations.length === 0 ? (
        <EmptyState
          title="No locations yet"
          description="Create your first location to build your world's geography."
          action={{ label: "Create Location", href: "/world/locations/new" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Card key={loc.id} className="p-4">
              <div className="space-y-2">
                {loc.mapUrl ? (
                  <Image
                    src={loc.mapUrl}
                    alt={loc.name}
                    width={400}
                    height={128}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/world/locations/${loc.id}`}
                    className="font-semibold hover:underline"
                  >
                    {loc.name}
                  </Link>
                  {loc.project && (
                    <p className="text-xs text-muted-foreground">{loc.project.title}</p>
                  )}
                </div>
                {loc.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{loc.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
