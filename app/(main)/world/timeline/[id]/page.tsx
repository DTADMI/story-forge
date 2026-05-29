import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { TimelineEditForm } from "./form";

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
  const characterIdsStr = String(formData.get("characterIds") || "").trim();
  const locationIdsStr = String(formData.get("locationIds") || "").trim();
  const characterIds = characterIdsStr ? characterIdsStr.split(",").filter(Boolean) : [];
  const locationIds = locationIdsStr ? locationIdsStr.split(",").filter(Boolean) : [];

  if (!title) return;

  await apiFetch(`/api/world/timeline/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title,
      date: date || undefined,
      description,
      projectId,
      characterIds,
      locationIds,
    }),
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

  const existingChars = (event.characters || []).map((c: { id: string }) => c.id);
  const existingLocs = (event.locations || []).map((l: { id: string }) => l.id);

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
        <TimelineEditForm
          event={event}
          existingCharacterIds={existingChars}
          existingLocationIds={existingLocs}
          action={updateTimelineEvent.bind(null, id)}
          deleteAction={deleteTimelineEvent.bind(null, id)}
        />
      </Card>
    </main>
  );
}
