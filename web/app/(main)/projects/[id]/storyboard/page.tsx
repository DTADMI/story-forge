import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Storyboard } from "@/components/editor/storyboard";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";

export default async function ProjectStoryboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">Project not found</h1>
      </main>
    );
  }

  const [characters, locations] = await Promise.all([
    prisma.character.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const settings = (project.settings as Record<string, unknown>) ?? {};
  const storyboardData = settings.storyboard as { panels: unknown[] } | undefined;
  const panels =
    (storyboardData?.panels as Array<{
      number: number;
      description: string;
      characterId: string;
      locationId: string;
    }>) || [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{project.title}</h1>
          <p className="text-fg/50 text-sm">Storyboard View</p>
        </div>
        <Link href={`/projects/${id}`} className="text-sm text-fg/50 hover:text-fg">
          Back to editor
        </Link>
      </div>

      {panels.length === 0 ? (
        <EmptyState
          title="No panels yet"
          description="Create your first storyboard panel to start visualizing your story layout."
        />
      ) : null}

      <Storyboard
        projectId={project.id}
        initialPanels={panels}
        characters={characters}
        locations={locations}
      />
    </main>
  );
}
