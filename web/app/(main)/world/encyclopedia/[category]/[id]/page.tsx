import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EncyclopediaEntryDelete } from "./delete";

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

async function getEntry(id: string) {
  const user = await getUser();
  if (!user) return null;
  return prisma.encyclopediaEntry.findFirst({
    where: { id, userId: user.id },
  });
}

export default async function EncyclopediaEntryDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { category, id } = await params;
  const entry = await getEntry(id);
  if (!entry) notFound();

  const label = categoryLabels[category] || category;

  let referencedEntries: { id: string; title: string }[] = [];
  if ((entry.metadata as any)?.references?.length) {
    const refIds = (entry.metadata as any).references as string[];
    const refs = await prisma.encyclopediaEntry.findMany({
      where: { id: { in: refIds }, userId: user.id },
      select: { id: true, title: true },
    });
    referencedEntries = refs;
  }

  const paragraphs = entry.content.split(/\n+/).filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/world" className="text-fg/40 hover:text-brand">
          World
        </Link>
        <span className="text-fg/20">/</span>
        <Link href="/world/encyclopedia" className="text-fg/40 hover:text-brand">
          Encyclopedia
        </Link>
        <span className="text-fg/20">/</span>
        <Link href={`/world/encyclopedia/${category}`} className="text-fg/40 hover:text-brand">
          {label}
        </Link>
        <span className="text-fg/20">/</span>
        <span className="text-fg font-medium">{entry.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand mb-2">
            {label}
          </span>
          <h1 className="text-3xl font-extrabold">{entry.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/world/encyclopedia/${category}/new?edit=${entry.id}`}
            className="px-3 py-1.5 text-sm border border-fg/20 rounded-md hover:bg-fg/5"
          >
            Edit
          </Link>
          <EncyclopediaEntryDelete entryId={entry.id} category={category} />
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-4 text-xs text-fg/40 mb-6">
        <span>Created {new Date(entry.createdAt).toLocaleDateString()}</span>
        <span>Updated {new Date(entry.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* Image */}
      {(entry.metadata as any)?.imageUrl && (
        <div className="mb-6">
          <img
            src={(entry.metadata as any).imageUrl}
            alt={entry.title}
            className="w-full max-h-96 object-cover rounded-lg border border-fg/10"
          />
        </div>
      )}

      {/* Content */}
      <Card className="p-6 mb-6">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""}>
              {p}
            </p>
          ))}
        </div>
      </Card>

      {/* References */}
      {referencedEntries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">References</h2>
          <div className="flex flex-wrap gap-2">
            {referencedEntries.map((ref) => (
              <Link
                key={ref.id}
                href={`/world/encyclopedia/${category}/${ref.id}`}
                className="text-sm px-3 py-1.5 rounded-md border border-fg/10 hover:bg-fg/5"
              >
                {ref.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/world/encyclopedia/${category}`}
        className="inline-flex items-center gap-1 text-sm text-fg/40 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {label}
      </Link>
    </main>
  );
}
