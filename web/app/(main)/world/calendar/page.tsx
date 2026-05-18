import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Plus } from "lucide-react";

async function getCalendars() {
  const res = await apiFetch("/api/world/calendar", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function CalendarPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const calendars = await getCalendars();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Calendars</h1>
          <p className="text-fg/60 text-sm mt-1">Design custom calendars for your world.</p>
        </div>
        <Link
          href="/world/calendar/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          Create Calendar
        </Link>
      </div>

      <Link href="/world" className="text-sm text-fg/40 hover:text-brand inline-block">
        &larr; Back to World
      </Link>

      {calendars.length === 0 ? (
        <EmptyState
          title="No calendars yet"
          description="Create your first custom calendar with months and days."
          action={{
            label: "Create Calendar",
            href: "/world/calendar/new",
          }}
        />
      ) : (
        <div className="grid gap-4">
          {calendars.map((cal: any) => {
            const months = cal.metadata?.months || [];
            const totalDays = months.reduce((sum: number, m: any) => sum + (m.days || 0), 0);
            return (
              <Link key={cal.id} href={`/world/calendar/${cal.id}`}>
                <Card className="p-4 hover:bg-fg/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold">{cal.name}</h3>
                      <p className="text-xs text-fg/40 mt-1">
                        {cal.weekLength || 7} days/week &middot; {months.length} months &middot;{" "}
                        {totalDays} days
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
