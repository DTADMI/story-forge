import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getLocation(id: string) {
  const res = await apiFetch(`/api/world/locations/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function updateLocation(id: string, formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const mapUrl = String(formData.get("mapUrl") || "").trim() || undefined;
  const projectId = String(formData.get("projectId") || "").trim() || undefined;

  if (!name) return;

  await apiFetch(`/api/world/locations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name, description, mapUrl, projectId }),
  });
  redirect("/world");
}

async function deleteLocation(id: string) {
  "use server";
  await apiFetch(`/api/world/locations/${id}`, { method: "DELETE" });
  redirect("/world");
}

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const location = await getLocation(id);
  if (!location) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world" className="text-sm text-fg/40 hover:text-brand">
          ← World
        </Link>
        <span className="text-fg/20">/</span>
        <h1 className="text-2xl font-extrabold">Edit {location.name}</h1>
      </div>

      <Card className="p-6">
        <form action={updateLocation.bind(null, id)} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              required
              defaultValue={location.name}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={location.description ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Map URL (optional)</label>
            <input
              name="mapUrl"
              placeholder="https://..."
              defaultValue={location.mapUrl ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Project (optional)</label>
            <input
              name="projectId"
              defaultValue={location.projectId ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <form action={deleteLocation.bind(null, id)}>
              <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
                Delete Location
              </button>
            </form>
            <div className="flex gap-3">
              <Link
                href="/world"
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
