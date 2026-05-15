import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { encyclopediaIcons } from "@/components/world/encyclopedia-icons";
import { Plus, ArrowLeft } from "lucide-react";

const categoryLabels: Record<string, string> = {
  research: "Research",
  calendar: "Calendar",
  magic: "Magic",
  fauna: "Fauna",
  flora: "Flora",
  culture: "Culture",
  item: "Items",
  system: "Systems",
  language: "Language",
  religion: "Religion",
  philosophy: "Philosophy",
};

export default async function EncyclopediaCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { category } = await params;
  const label = categoryLabels[category] || category;
  const Icon = encyclopediaIcons[category];

  const entries = await prisma.encyclopediaEntry.findMany({
    where: { userId: user.id, category },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/world/encyclopedia"
          className="p-1.5 rounded-md hover:bg-fg/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {Icon && <Icon className="h-6 w-6 text-brand" />}
        <h1 className="text-2xl font-extrabold">{label}</h1>
      </div>

      <Link
        href={`/world/encyclopedia/${category}/new`}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
      >
        <Plus className="h-4 w-4" />
        New Entry
      </Link>

      {entries.length === 0 ? (
        <EmptyState
          title={`No ${label} entries yet`}
          description="Start building your encyclopedia by creating your first entry."
          action={{
            label: `Create first ${label} entry`,
            href: `/world/encyclopedia/${category}/new`,
          }}
        />
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/world/encyclopedia/${category}/${entry.id}`}>
              <Card className="p-4 hover:bg-fg/5 transition-colors">
                <h3 className="text-base font-bold">{entry.title}</h3>
                <p className="text-sm text-fg/50 mt-1 line-clamp-2">
                  {entry.content}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-fg/40">
                  <span>
                    Created{" "}
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    Updated{" "}
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
