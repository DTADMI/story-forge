import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { TimelineForm } from "./form";

async function createTimelineEvent(formData: FormData) {
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

  await apiFetch("/api/world/timeline", {
    method: "POST",
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

export default async function NewTimelineEventPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">New Timeline Event</h1>
      <Card className="p-6">
        <TimelineForm action={createTimelineEvent} />
      </Card>
    </main>
  );
}
