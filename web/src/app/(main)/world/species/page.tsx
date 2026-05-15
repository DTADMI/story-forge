import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Plus } from "lucide-react";

async function getSpecies() {
  const res = await apiFetch("/api/world/species", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function SpeciesPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const species = await getSpecies();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Species &amp; Races</h1>
          <p className="text-fg/60 text-sm mt-1">
            Intelligent species and races that populate your world.
          </p>
        </div>
        <Link
          href="/world/species/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          New Species
        </Link>
      </div>

      <Link href="/world" className="text-sm text-fg/40 hover:text-brand inline-block">
        &larr; Back to World
      </Link>

      {species.length === 0 ? (
        <EmptyState
          title="No species yet"
          description="Create the first species or race in your world."
          action={{
            label: "Create Species",
            href: "/world/species/new",
          }}
        />
      ) : (
        <div className="grid gap-4">
          {species.map((s: any) => (
            <Link key={s.id} href={`/world/species/${s.id}`}>
              <Card className="p-4 hover:bg-fg/5 transition-colors">
                <h3 className="text-base font-bold">{s.name}</h3>
                {s.description && (
                  <p className="text-sm text-fg/50 mt-1 line-clamp-2">{s.description}</p>
                )}
                {s.traits && (
                  <p className="text-xs text-fg/40 mt-1 italic line-clamp-1">{s.traits}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
