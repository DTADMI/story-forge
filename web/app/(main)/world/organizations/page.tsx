import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Plus } from "lucide-react";

const typeLabels: Record<string, string> = {
  faction: "Faction",
  guild: "Guild",
  kingdom: "Kingdom",
  clan: "Clan",
  corporation: "Corporation",
  cult: "Cult",
  other: "Other",
};

async function getOrganizations() {
  const res = await apiFetch("/api/world/organizations", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function OrganizationsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const organizations = await getOrganizations();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Organizations &amp; Factions</h1>
          <p className="text-fg/60 text-sm mt-1">
            Guilds, kingdoms, corporations, and other groups in your world.
          </p>
        </div>
        <Link
          href="/world/organizations/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          New Organization
        </Link>
      </div>

      <Link href="/world" className="text-sm text-fg/40 hover:text-brand inline-block">
        &larr; Back to World
      </Link>

      {organizations.length === 0 ? (
        <EmptyState
          title="No organizations yet"
          description="Create your first faction, guild, or organization."
          action={{
            label: "Create Organization",
            href: "/world/organizations/new",
          }}
        />
      ) : (
        <div className="grid gap-4">
          {organizations.map((org: any) => (
            <Link key={org.id} href={`/world/organizations/${org.id}`}>
              <Card className="p-4 hover:bg-fg/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                    {typeLabels[org.type] || org.type || "Other"}
                  </span>
                  <h3 className="text-base font-bold">{org.name}</h3>
                </div>
                {org.description && (
                  <p className="text-sm text-fg/50 mt-2 line-clamp-2">{org.description}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
