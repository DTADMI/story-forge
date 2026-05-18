import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { encyclopediaIcons } from "@/components/world/encyclopedia-icons";

const categories = [
  { key: "research", label: "Research" },
  { key: "calendar", label: "Calendar" },
  { key: "magic", label: "Magic" },
  { key: "fauna", label: "Fauna" },
  { key: "flora", label: "Flora" },
  { key: "culture", label: "Culture" },
  { key: "item", label: "Items" },
  { key: "system", label: "Systems" },
  { key: "language", label: "Language" },
  { key: "religion", label: "Religion" },
  { key: "philosophy", label: "Philosophy" },
];

export default async function EncyclopediaPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const counts = await prisma.encyclopediaEntry.groupBy({
    by: ["category"],
    where: { userId: user.id },
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  counts.forEach((c) => {
    countMap[c.category] = c._count.id;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">Encyclopedia</h1>
        <p className="text-fg/60 mt-1">
          Build your world&apos;s lore across multiple knowledge categories.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = encyclopediaIcons[cat.key];
          const count = countMap[cat.key] || 0;

          return (
            <Link key={cat.key} href={`/world/encyclopedia/${cat.key}`}>
              <Card className="p-4 h-full hover:bg-fg/5 transition-colors">
                <div className="flex flex-col items-center text-center gap-2">
                  {Icon && <Icon className="h-8 w-8 text-brand" />}
                  <h3 className="text-sm font-semibold">{cat.label}</h3>
                  <span className="text-xs text-fg/40">
                    {count} {count === 1 ? "entry" : "entries"}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
