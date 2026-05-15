import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getCharacter(id: string) {
  const res = await apiFetch(`/api/world/characters/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function updateCharacter(id: string, formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const traits = String(formData.get("traits") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const quirks = String(formData.get("quirks") || "").trim();
  const projectId = String(formData.get("projectId") || "").trim() || undefined;

  if (!name) return;

  await apiFetch(`/api/world/characters/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name, traits, bio, quirks, projectId }),
  });
  redirect("/world");
}

async function deleteCharacter(id: string, formData: FormData) {
  "use server";
  "use server";
  await apiFetch(`/api/world/characters/${id}`, { method: "DELETE" });
  redirect("/world");
}

export default async function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const character = await getCharacter(id);
  if (!character) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world" className="text-sm text-fg/40 hover:text-brand">
          ← World
        </Link>
        <span className="text-fg/20">/</span>
        <h1 className="text-2xl font-extrabold">Edit {character.name}</h1>
      </div>

      <Card className="p-6">
        <form action={updateCharacter.bind(null, id)} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              required
              defaultValue={character.name}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Traits / Keywords</label>
            <input
              name="traits"
              placeholder="e.g. Brave, Impatient, Noble"
              defaultValue={character.traits ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Quirks</label>
            <input
              name="quirks"
              placeholder="e.g. Always wears mismatched socks"
              defaultValue={character.quirks ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bio / Backstory</label>
            <textarea
              name="bio"
              rows={5}
              defaultValue={character.bio ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Project (optional)</label>
            <input
              name="projectId"
              defaultValue={character.projectId ?? ""}
              className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            />
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <form action={deleteCharacter.bind(null, id)}>
              <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
                Delete Character
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
