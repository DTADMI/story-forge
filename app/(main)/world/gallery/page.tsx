import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import NextImage from "next/image";
import { Image as ImageIcon } from "lucide-react";

export default async function GalleryPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [characters, locations] = await Promise.all([
    prisma.character.findMany({
      where: { userId: user.id, imageUrl: { not: null } },
      select: { id: true, name: true, imageUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { userId: user.id, mapUrl: { not: null } },
      select: { id: true, name: true, mapUrl: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const items = [
    ...characters.map((c) => ({
      id: c.id,
      name: c.name,
      url: c.imageUrl!,
      type: "character" as const,
      href: `/world/characters/${c.id}`,
    })),
    ...locations.map((l) => ({
      id: l.id,
      name: l.name,
      url: l.mapUrl!,
      type: "location" as const,
      href: `/world/locations/${l.id}`,
    })),
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-2">Gallery</h1>
      <p className="text-fg/60 mb-8">All your character and location images.</p>

      {items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-6 w-6 text-fg/30" />}
          title="No images yet"
          description="Upload images to your characters and locations to see them here."
          action={{ label: "Go to World", href: "/world" }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={`${item.type}-${item.id}`} href={item.href}>
              <div className="group relative aspect-square overflow-hidden rounded-lg border border-fg/10 bg-fg/5">
                <NextImage
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <div>
                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                    <span className="text-white/60 text-xs capitalize">{item.type}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
