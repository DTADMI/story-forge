import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";

async function createDialogue(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const projectId = String(formData.get("projectId") || "").trim() || undefined;
  const contentRaw = String(formData.get("content") || "").trim();

  let content;
  try {
    content = JSON.parse(contentRaw || "[]");
  } catch {
    // Store as simple string lines if not valid JSON
    content = contentRaw ? contentRaw.split("\n").map((line) => ({ text: line })) : [];
  }

  await apiFetch("/api/world/dialogues", {
    method: "POST",
    body: JSON.stringify({ title: title || undefined, projectId, content }),
  });
  redirect("/world/dialogues");
}

export default async function NewDialoguePage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">New Dialogue Scene</h1>
      <Card className="p-6">
        <form action={createDialogue} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Scene Title</label>
            <input
              name="title"
              placeholder="e.g. The Confrontation"
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Project (optional)</label>
            <input
              name="projectId"
              placeholder="Project ID"
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Dialogue Content (JSON array of speaker/line objects, or plain text)
            </label>
            <textarea
              name="content"
              rows={12}
              placeholder='[{"speaker":"ALICE","line":"Hello!"},{"speaker":"BOB","line":"Hi."}]'
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg font-mono"
            />
            <p className="text-xs text-fg/40 mt-1">
              Format: JSON array of {"{speaker, line}"} objects. Plain text is also accepted (one
              line per entry).
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <a
              href="/world/dialogues"
              className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
            >
              Cancel
            </a>
            <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Scene
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}
