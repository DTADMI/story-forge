import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { FamilyTree } from "@/components/world/family-tree";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getCharacter(id: string) {
  const user = await getUser();
  if (!user) return null;
  return prisma.character.findFirst({
    where: { id, userId: user.id },
  });
}

export default async function CharacterFamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const character = await getCharacter(id);
  if (!character) notFound();

  const connections = (character.metadata as any)?.connections || [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/world/characters/${id}`} className="text-sm text-fg/40 hover:text-brand">
          &larr; Back to {character.name}
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold mb-2">Family Tree</h1>
      <p className="text-fg/60 text-sm mb-6">Visual relationship graph for {character.name}.</p>

      <Card className="p-6">
        <FamilyTree
          characterId={character.id}
          characterName={character.name}
          relationships={connections}
        />
      </Card>

      {connections.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-3">Relationship Legend</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Array.from(new Set(connections.map((c: any) => c.type))).map((type) => (
              <div key={type as string} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getColor(type as string) }}
                />
                <span className="capitalize">{type as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function getColor(type: string): string {
  const colors: Record<string, string> = {
    parent: "#e11d48",
    child: "#7c3aed",
    sibling: "#2563eb",
    spouse: "#ec4899",
    lover: "#f43f5e",
    rival: "#f97316",
    ally: "#22c55e",
    mentor: "#06b6d4",
    student: "#8b5cf6",
    friend: "#3b82f6",
    enemy: "#ef4444",
  };
  return colors[type] || "#9ca3af";
}
