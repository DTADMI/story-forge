import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getDialogues() {
  const res = await apiFetch("/api/world/dialogues", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function DialoguesPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const dialogues = await getDialogues();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Dialogue Scenes</h1>
          <p className="text-fg/60 mt-1">Scripted dialogue for your screenplay, comic, or novel.</p>
        </div>
        <Link
          href="/world/dialogues/new"
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Scene
        </Link>
      </header>

      <div className="space-y-4">
        {dialogues.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-fg/40">No dialogue scenes yet.</p>
            <Link
              href="/world/dialogues/new"
              className="text-sm text-brand font-medium hover:underline mt-2 inline-block"
            >
              Create your first dialogue scene
            </Link>
          </Card>
        ) : (
          dialogues.map((d: any) => (
            <Card key={d.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{d.title || "Untitled Scene"}</h3>
                {d.project && <p className="text-xs text-fg/40">{d.project.title}</p>}
              </div>
              <Link
                href={`/world/dialogues/${d.id}`}
                className="text-xs text-fg/40 hover:text-brand"
              >
                Edit
              </Link>
            </Card>
          ))
        )}
      </div>

      <Link href="/world" className="text-sm text-fg/40 hover:text-brand inline-block">
        ← Back to World
      </Link>
    </main>
  );
}
