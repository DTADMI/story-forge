import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function ModerationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try finding as project first, then character
  const [project, character] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, username: true } } },
    }),
    prisma.character.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, username: true } }, project: true },
    }),
  ]);

  const entity = project || character;
  if (!entity) notFound();

  const isProject = "title" in entity && "content" in entity;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/moderation" className="text-sm text-fg/40 hover:text-brand">
          ← Moderation
        </Link>
        <h1 className="text-2xl font-extrabold">
          Review: {isProject ? (entity as typeof project)!.title : (entity as typeof character)!.name}
        </h1>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-fg/40">Type</span>
            <p className="font-medium">{isProject ? "Project" : "Character"}</p>
          </div>
          <div>
            <span className="text-xs text-fg/40">Author</span>
            <p className="font-medium">
              <Link href={`/admin/users/${entity.user?.id}`} className="hover:text-brand">
                {entity.user?.username || entity.user?.name || "—"}
              </Link>
            </p>
          </div>
          <div>
            <span className="text-xs text-fg/40">Created</span>
            <p className="font-medium">{new Date(entity.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {isProject && (
          <>
            <div>
              <span className="text-xs text-fg/40">Description</span>
              <p className="text-sm mt-1">{(entity as typeof project)!.description || "No description"}</p>
            </div>
            <div>
              <span className="text-xs text-fg/40">Content</span>
              <div className="mt-2 p-3 bg-fg/3 rounded text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
                {(entity as typeof project)!.content?.slice(0, 5000) || "No content"}
              </div>
            </div>
          </>
        )}

        {!isProject && (
          <div className="space-y-3">
            <div>
              <span className="text-xs text-fg/40">Traits</span>
              <p className="text-sm">{(entity as typeof character)!.traits || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-fg/40">Quirks</span>
              <p className="text-sm">{(entity as typeof character)!.quirks || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-fg/40">Bio</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{(entity as typeof character)!.bio || "—"}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-bold mb-3">Moderation Actions</h2>
        <p className="text-sm text-fg/40">
          Content moderation actions will be available here (flag, approve, delete, warn user).
        </p>
      </Card>
    </div>
  );
}
