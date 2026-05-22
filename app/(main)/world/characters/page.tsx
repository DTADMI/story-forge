import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Characters — StoryForge" };

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const user = await getUser();
  if (!user) return null;
  const { projectId } = await searchParams;

  const characters = await prisma.character.findMany({
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
          <h1 className="text-2xl font-bold tracking-tight">Characters</h1>
          <p className="text-muted-foreground">Build and manage your cast of characters.</p>
        </div>
        <Link href="/world/characters/new" className={cn(buttonVariants({ size: "default" }))}>
          New Character
        </Link>
      </div>

      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/world/characters"
            className={cn(
              buttonVariants({ variant: !projectId ? "default" : "outline", size: "sm" })
            )}
          >
            All Projects
          </Link>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/world/characters?projectId=${p.id}`}
              className={cn(
                buttonVariants({ variant: projectId === p.id ? "default" : "outline", size: "sm" })
              )}
            >
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {characters.length === 0 ? (
        <EmptyState
          title="No characters yet"
          description="Create your first character to bring your story to life."
          action={{ label: "Create Character", href: "/world/characters/new" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((char) => (
            <Card key={char.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  {char.imageUrl ? (
                    <Image
                      src={char.imageUrl}
                      alt={char.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xl font-semibold text-muted-foreground">
                        {char.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      href={`/world/characters/${char.id}`}
                      className="font-semibold hover:underline line-clamp-1"
                    >
                      {char.name}
                    </Link>
                    {char.traits && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{char.traits}</p>
                    )}
                    {char.project && (
                      <p className="text-xs text-muted-foreground">{char.project.title}</p>
                    )}
                  </div>
                </div>
                {char.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{char.bio}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
