import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpeciesEditForm } from "./edit-form";

async function getSpecies(id: string) {
  const res = await apiFetch(`/api/world/species/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function deleteSpecies(id: string) {
  "use server";
  await apiFetch(`/api/world/species/${id}`, { method: "DELETE" });
  redirect("/world/species");
}

export default async function SpeciesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const species = await getSpecies(id);
  if (!species) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/species" className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">{species.name}</h1>
      </div>

      <Card className="p-6 space-y-4 mb-6">
        {species.description && (
          <div>
            <h3 className="text-sm font-semibold text-fg/50 mb-1">Description</h3>
            <p className="text-sm whitespace-pre-wrap">{species.description}</p>
          </div>
        )}
        {species.appearance && (
          <div>
            <h3 className="text-sm font-semibold text-fg/50 mb-1">Appearance</h3>
            <p className="text-sm whitespace-pre-wrap">{species.appearance}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {species.traits && (
            <div>
              <h3 className="text-sm font-semibold text-fg/50 mb-1">Traits</h3>
              <p className="text-sm">{species.traits}</p>
            </div>
          )}
          {species.lifespan && (
            <div>
              <h3 className="text-sm font-semibold text-fg/50 mb-1">Lifespan</h3>
              <p className="text-sm">{species.lifespan}</p>
            </div>
          )}
          {species.homeland && (
            <div>
              <h3 className="text-sm font-semibold text-fg/50 mb-1">Homeland</h3>
              <p className="text-sm">{species.homeland}</p>
            </div>
          )}
        </div>
      </Card>

      <SpeciesEditForm species={species} />

      <div className="flex justify-between items-center mt-6">
        <form action={deleteSpecies.bind(null, id)}>
          <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
            Delete Species
          </button>
        </form>
        <Link
          href="/world/species"
          className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
        >
          Back to Species
        </Link>
      </div>
    </main>
  );
}
