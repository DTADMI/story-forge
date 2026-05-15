import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProjectEditor } from "@/components/editor/project-editor";
import { VersionHistory } from "@/components/editor/version-history";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

export default async function ProjectDetailPage({
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

  // Fetch comments
  const comments = await prisma.comment.findMany({
    where: { projectId: id, parentId: null },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      {/* Editor */}
      <ProjectEditor project={project} userPreferences={undefined} />

      {/* Export button */}
      <div className="flex items-center gap-3">
        <a
          href={`/api/projects/${id}/export`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-fg/20 rounded-md hover:bg-fg/5"
        >
          <Download className="h-4 w-4" />
          Export as Markdown
        </a>
      </div>

      {/* Version History */}
      <div className="border-t border-fg/10 pt-8">
        <h2 className="text-lg font-bold mb-4">Version History</h2>
        <VersionHistory projectId={project.id} />
      </div>

      {/* Settings */}
      <div className="border-t border-fg/10 pt-8">
        <h2 className="text-lg font-bold mb-4">Project Settings</h2>
        <form action={updateSettings.bind(null, project.id)} className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              defaultValue={project.title}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={project.description || ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Visibility</label>
            <select
              name="defaultScope"
              defaultValue={project.defaultScope}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            >
              <option value="PRIVATE">Private</option>
              <option value="FRIENDS">Friends</option>
              <option value="PUBLIC_AUTHENTICATED">Public (Authenticated)</option>
              <option value="PUBLIC_ANYONE">Public (Anyone)</option>
            </select>
          </div>
          <button className="w-fit bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand/90">
            Save Settings
          </button>
        </form>
      </div>

      {/* Comments */}
      <div className="border-t border-fg/10 pt-8">
        <h2 className="text-lg font-bold mb-4">
          Comments ({comments.length})
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm text-fg/40">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <Card key={c.id} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {c.user.username || c.user.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-fg/40">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{c.content}</p>
                {c.replies.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-fg/10 pl-3">
                    {c.replies.map((r) => (
                      <div key={r.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {r.user.username || r.user.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-fg/40">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

async function updateSettings(id: string, formData: FormData) {
  "use server";
  const { getUser } = await import("@/lib/supabase/server");
  const { prisma } = await import("@/lib/prisma");
  const { redirect } = await import("next/navigation");

  const user = await getUser();
  if (!user) return;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const defaultScope = String(formData.get("defaultScope") || "PRIVATE");

  await prisma.project.update({
    where: { id, userId: user.id },
    data: { title: title || undefined, description: description || undefined, defaultScope },
  });
  redirect(`/projects/${id}`);
}
