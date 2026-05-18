import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getTimelineEvents() {
  const res = await apiFetch("/api/world/timeline", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function TimelinePage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const events = await getTimelineEvents();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Timeline</h1>
          <p className="text-fg/60 mt-1">Story events, beats, and key moments.</p>
        </div>
        <Link
          href="/world/timeline/new"
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Event
        </Link>
      </header>

      <div className="space-y-4">
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-fg/40">No timeline events yet.</p>
            <Link
              href="/world/timeline/new"
              className="text-sm text-brand font-medium hover:underline mt-2 inline-block"
            >
              Create your first event
            </Link>
          </Card>
        ) : (
          events.map((event: any) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{event.title}</h3>
                    {event.date && (
                      <span className="text-xs text-fg/40 bg-fg/5 px-2 py-0.5 rounded">
                        {event.date}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-fg/60 mt-1 line-clamp-2">{event.description}</p>
                  )}
                  {event.characters?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.characters.map((c: any) => (
                        <span
                          key={c.id}
                          className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {event.locations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.locations.map((l: any) => (
                        <span
                          key={l.id}
                          className="text-xs bg-fg/5 text-fg/60 px-2 py-0.5 rounded-full"
                        >
                          📍 {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/world/timeline/${event.id}`}
                  className="text-xs text-fg/40 hover:text-brand shrink-0 ml-4"
                >
                  Edit
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>

      <Link href="/world" className="text-sm text-fg/40 hover:text-brand inline-block">
        ← Back to World
      </Link>
    </main>
  );
}
