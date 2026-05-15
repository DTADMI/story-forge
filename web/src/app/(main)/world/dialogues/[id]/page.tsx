import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getDialogue(id: string) {
  const res = await apiFetch(`/api/world/dialogues/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function updateDialogue(id: string, formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const projectId = String(formData.get("projectId") || "").trim() || undefined;
  const contentRaw = String(formData.get("content") || "").trim();

  let content;
  try {
    content = JSON.parse(contentRaw || "[]");
  } catch {
    content = contentRaw
      ? contentRaw.split("\n").map((line: string) => ({ text: line }))
      : [];
  }

  await apiFetch(`/api/world/dialogues/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title: title || undefined, projectId, content }),
  });
  redirect("/world/dialogues");
}

async function deleteDialogue(id: string) {
  "use server";
  await apiFetch(`/api/world/dialogues/${id}`, { method: "DELETE" });
  redirect("/world/dialogues");
}

export default async function DialogueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const dialogue = await getDialogue(id);
  if (!dialogue) notFound();

  const contentStr = JSON.stringify(dialogue.content, null, 2);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/dialogues" className="text-sm text-fg/40 hover:text-brand">
          ← Dialogues
        </Link>
        <span className="text-fg/20">/</span>
        <h1 className="text-2xl font-extrabold">Edit {dialogue.title || "Scene"}</h1>
      </div>

      <Card className="p-6">
        <form action={updateDialogue.bind(null, id)} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Scene Title</label>
            <input
              name="title"
              defaultValue={dialogue.title ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Project (optional)</label>
            <input
              name="projectId"
              defaultValue={dialogue.projectId ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dialogue Content (JSON)</label>
            <textarea
              name="content"
              rows={16}
              defaultValue={contentStr}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg font-mono"
            />
            <p className="text-xs text-fg/40 mt-1">
              Format: JSON array of {"{speaker, line}"} objects.
            </p>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <form action={deleteDialogue.bind(null, id)}>
              <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
                Delete Scene
              </button>
            </form>
            <div className="flex gap-3">
              <Link
                href="/world/dialogues"
                className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
              >
                Cancel
              </Link>
              <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Card>
    </main>
  );
}
