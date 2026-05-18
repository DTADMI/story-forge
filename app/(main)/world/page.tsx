import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function WorldPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [characters, locations, timeline] = await Promise.all([
    prisma.character.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.timelineEvent.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
      take: 5,
      include: { characters: true, locations: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">World Building</h1>
          <p className="text-fg/60 mt-1">
            Manage your story&apos;s characters, locations, timeline, and dialogue.
          </p>
        </div>
      </header>
      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Characters</h2>
            <Link
              href="/world/characters/new"
              className="text-sm text-brand font-medium hover:underline"
            >
              + New Character
            </Link>
          </div>
          <div className="space-y-4">
            {characters.length === 0 ? (
              <p className="text-sm text-fg/40">No characters yet.</p>
            ) : (
              characters.map((c) => (
                <Card key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    {c.traits && <p className="text-xs text-fg/60 italic">{c.traits}</p>}
                  </div>
                  <Link
                    href={`/world/characters/${c.id}`}
                    className="text-xs text-fg/40 hover:text-brand"
                  >
                    Edit
                  </Link>
                </Card>
              ))
            )}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Locations</h2>
            <Link
              href="/world/locations/new"
              className="text-sm text-brand font-medium hover:underline"
            >
              + New Location
            </Link>
          </div>
          <div className="space-y-4">
            {locations.length === 0 ? (
              <p className="text-sm text-fg/40">No locations yet.</p>
            ) : (
              locations.map((l) => (
                <Card key={l.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{l.name}</h3>
                    {l.description && (
                      <p className="text-xs text-fg/60 line-clamp-1">{l.description}</p>
                    )}
                  </div>
                  <Link
                    href={`/world/locations/${l.id}`}
                    className="text-xs text-fg/40 hover:text-brand"
                  >
                    Edit
                  </Link>
                </Card>
              ))
            )}
          </div>
        </section>
        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Timeline</h2>
            <Link href="/world/timeline" className="text-sm text-brand font-medium hover:underline">
              View All ({timeline.length})
            </Link>
          </div>
          {timeline.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-fg/40">No timeline events yet.</p>
              <Link
                href="/world/timeline/new"
                className="text-sm text-brand font-medium hover:underline mt-1 inline-block"
              >
                + Create your first event
              </Link>
            </Card>
          ) : (
            timeline.map((event) => (
              <Card key={event.id} className="p-4 mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{event.title}</h3>
                  {event.date && <span className="text-xs text-fg/40">{event.date}</span>}
                </div>
                <Link
                  href={`/world/timeline/${event.id}`}
                  className="text-xs text-fg/40 hover:text-brand"
                >
                  Edit
                </Link>
              </Card>
            ))
          )}
        </section>
        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Dialogue Scenes</h2>
            <Link
              href="/world/dialogues"
              className="text-sm text-brand font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <Card className="p-6 text-center">
            <p className="text-sm text-fg/40">
              Scripted dialogue for screenplays, comics, and scenes.
            </p>
            <Link
              href="/world/dialogues/new"
              className="text-sm text-brand font-medium hover:underline mt-1 inline-block"
            >
              + Create a dialogue scene
            </Link>
          </Card>
        </section>

        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Encyclopedia</h2>
            <Link
              href="/world/encyclopedia"
              className="text-sm text-brand font-medium hover:underline"
            >
              Browse
            </Link>
          </div>
          <Card className="p-6 text-center">
            <p className="text-sm text-fg/40">
              Research notes, magic systems, flora & fauna, cultures, and more.
            </p>
            <Link
              href="/world/encyclopedia"
              className="text-sm text-brand font-medium hover:underline mt-1 inline-block"
            >
              Explore the encyclopedia
            </Link>
          </Card>
        </section>

        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Visualizations</h2>
            <div className="flex gap-3">
              <Link
                href="/world/timeline/viz"
                className="text-sm text-brand font-medium hover:underline"
              >
                Timeline Viz
              </Link>
              <Link href="/world/galaxy" className="text-sm text-brand font-medium hover:underline">
                Galaxy View
              </Link>
              <Link
                href="/world/gallery"
                className="text-sm text-brand font-medium hover:underline"
              >
                Image Gallery
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
