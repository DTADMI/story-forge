import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TimelineViz } from "@/components/world/timeline-viz";
import Link from "next/link";

export default async function TimelineVizPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const [events, eras] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
      include: {
        characters: { select: { id: true, name: true } },
        locations: { select: { id: true, name: true } },
      },
    }),
    prisma.era.findMany({
      where: { userId: user.id },
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, color: true, startDate: true, endDate: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Timeline Visualization</h1>
          <p className="text-fg/60 text-sm mt-1">
            Scroll to explore. Hold Ctrl/Cmd + scroll to zoom.
          </p>
        </div>
        <Link href="/world/timeline" className="text-sm text-fg/40 hover:text-brand">
          List View
        </Link>
      </div>

      <TimelineViz events={events} eras={eras} />
    </main>
  );
}
