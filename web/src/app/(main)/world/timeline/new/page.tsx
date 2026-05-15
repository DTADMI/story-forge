import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";

async function createTimelineEvent(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const projectId = String(formData.get("projectId") || "").trim() || undefined;

  if (!title) return;

  await apiFetch("/api/world/timeline", {
    method: "POST",
    body: JSON.stringify({ title, date: date || undefined, description, projectId }),
  });
  redirect("/world/timeline");
}

export default async function NewTimelineEventPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">New Timeline Event</h1>
      <Card className="p-6">
        <form action={createTimelineEvent} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. The Inciting Incident"
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date (flexible format)</label>
            <input
              name="date"
              placeholder="e.g. Chapter 3, 1920s, Day 47"
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="What happens at this point in the story..."
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
          <div className="flex justify-end gap-3 mt-4">
            <a
              href="/world/timeline"
              className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
            >
              Cancel
            </a>
            <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Event
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}
