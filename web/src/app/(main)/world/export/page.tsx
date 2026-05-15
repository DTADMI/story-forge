import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function WorldExportPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const filter = { userId: user.id };

  const [charCount, locCount, timelineCount, encCount, orgCount, speciesCount] =
    await Promise.all([
      prisma.character.count({ where: filter }),
      prisma.location.count({ where: filter }),
      prisma.timelineEvent.count({ where: filter }),
      prisma.encyclopediaEntry.count({ where: filter }),
      prisma.organization.count({ where: filter }),
      prisma.species.count({ where: filter }),
    ]);

  const totalCount =
    charCount + locCount + timelineCount + encCount + orgCount + speciesCount;

  const stats = [
    { label: "Characters", count: charCount },
    { label: "Locations", count: locCount },
    { label: "Timeline Events", count: timelineCount },
    { label: "Encyclopedia Entries", count: encCount },
    { label: "Organizations", count: orgCount },
    { label: "Species", count: speciesCount },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-extrabold">Export World</h1>
      <p className="text-fg/60 text-sm">
        Download your entire world bible as a JSON file or formatted Markdown document.
      </p>

      <Link href="/world" className="text-sm text-fg/40 hover:text-brand inline-block">
        &larr; Back to World
      </Link>

      {/* Entity Counts */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Entities to Export</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-fg/10 rounded-lg p-3 text-center">
              <span className="text-2xl font-extrabold text-brand">{stat.count}</span>
              <p className="text-xs text-fg/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-fg/40 mt-4 text-center">
          {totalCount} total entities will be exported
        </p>
      </Card>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-2">Export World Bible (JSON)</h3>
          <p className="text-sm text-fg/50 mb-4">
            Download a structured JSON file with all your world data. Suitable for backup, import, or programmatic use.
          </p>
          <a
            href="/api/world/export"
            download
            className="inline-block bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90"
          >
            Download JSON
          </a>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-2">Export Markdown</h3>
          <p className="text-sm text-fg/50 mb-4">
            Download a formatted Markdown file suitable for reading, printing, or importing into writing tools.
          </p>
          <a
            href="/api/world/export?format=markdown"
            download
            className="inline-block bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90"
          >
            Download Markdown
          </a>
        </Card>
      </div>
    </main>
  );
}
