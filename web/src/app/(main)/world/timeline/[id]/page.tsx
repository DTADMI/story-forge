import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getTimelineEvent(id: string) {
  const res = await apiFetch(`/api/world/timeline/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function updateTimelineEvent(id: string, formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const projectId = String(formData.get("projectId") || "").trim() || undefined;

  if (!title) return;

  await apiFetch(`/api/world/timeline/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title, date: date || undefined, description, projectId }),
  });
  redirect("/world/timeline");
}

async function deleteTimelineEvent(id: string) {
  "use server";
  await apiFetch(`/api/world/timeline/${id}`, { method: "DELETE" });
  redirect("/world/timeline");
}

export default async function TimelineEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const event = await getTimelineEvent(id);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/timeline" className="text-sm text-fg/40 hover:text-brand">
          ← Timeline
        </Link>
        <span className="text-fg/20">/</span>
        <h1 className="text-2xl font-extrabold">Edit Event</h1>
      </div>

      <Card className="p-6">
        <form action={updateTimelineEvent.bind(null, id)} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              required
              defaultValue={event.title}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date (flexible format)</label>
            <input
              name="date"
              defaultValue={event.date ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={event.description ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Project (optional)</label>
            <input
              name="projectId"
              defaultValue={event.projectId ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <form action={deleteTimelineEvent.bind(null, id)}>
              <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
                Delete Event
              </button>
            </form>
            <div className="flex gap-3">
              <Link
                href="/world/timeline"
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
