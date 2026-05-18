import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrganizationEditForm } from "./edit-form";

const typeLabels: Record<string, string> = {
  faction: "Faction",
  guild: "Guild",
  kingdom: "Kingdom",
  clan: "Clan",
  corporation: "Corporation",
  cult: "Cult",
  other: "Other",
};

async function getOrganization(id: string) {
  const res = await apiFetch(`/api/world/organizations/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function deleteOrganization(id: string) {
  "use server";
  await apiFetch(`/api/world/organizations/${id}`, { method: "DELETE" });
  redirect("/world/organizations");
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const org = await getOrganization(id);
  if (!org) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/organizations" className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">{org.name}</h1>
      </div>

      {/* Detail View */}
      <Card className="p-6 space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand">
            {typeLabels[org.type] || org.type || "Other"}
          </span>
        </div>

        {org.goals && (
          <div>
            <h3 className="text-sm font-semibold text-fg/50 mb-1">Goals</h3>
            <p className="text-sm whitespace-pre-wrap">{org.goals}</p>
          </div>
        )}

        {org.description && (
          <div>
            <h3 className="text-sm font-semibold text-fg/50 mb-1">Description</h3>
            <p className="text-sm whitespace-pre-wrap">{org.description}</p>
          </div>
        )}
      </Card>

      {/* Edit Form */}
      <OrganizationEditForm org={org} />

      {/* Delete */}
      <div className="flex justify-between items-center mt-6">
        <form action={deleteOrganization.bind(null, id)}>
          <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
            Delete Organization
          </button>
        </form>
        <Link
          href="/world/organizations"
          className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
        >
          Back to Organizations
        </Link>
      </div>
    </main>
  );
}
