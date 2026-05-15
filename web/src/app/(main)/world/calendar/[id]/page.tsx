import { getUser } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getCalendar(id: string) {
  const res = await apiFetch(`/api/world/calendar/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function deleteCalendar(id: string) {
  "use server";
  await apiFetch(`/api/world/calendar/${id}`, { method: "DELETE" });
  redirect("/world/calendar");
}

export default async function CalendarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/signin");

  const { id } = await params;
  const cal = await getCalendar(id);
  if (!cal) notFound();

  const months = cal.metadata?.months || [];
  const weekLength = cal.weekLength || 7;
  const weekDays = Array.from({ length: weekLength }, (_, i) => i + 1);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/calendar" className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">{cal.name}</h1>
      </div>

      <div className="flex items-center gap-4 mb-6 text-sm text-fg/50">
        <span>{weekLength} days per week</span>
        <span>{months.length} months</span>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-6">
        {months.map((month: any) => {
          const rows: number[][] = [];
          let currentRow: number[] = [];
          for (let d = 1; d <= month.days; d++) {
            currentRow.push(d);
            if (currentRow.length === weekLength || d === month.days) {
              rows.push(currentRow);
              currentRow = [];
            }
          }
          return (
            <Card key={month.orderIndex} className="p-4">
              <h3 className="text-base font-bold mb-3">{month.name}</h3>
              <div className="border border-fg/10 rounded overflow-hidden">
                <div
                  className="grid"
                  style={{ gridTemplateColumns: `repeat(${weekLength}, 1fr)` }}
                >
                  {weekDays.map((d) => (
                    <span
                      key={d}
                      className="text-xs text-fg/40 text-center py-1.5 border-b border-fg/10 bg-fg/5 font-medium"
                    >
                      D{d}
                    </span>
                  ))}
                </div>
                {rows.map((row, ri) => (
                  <div
                    key={ri}
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${weekLength}, 1fr)` }}
                  >
                    {Array.from({ length: weekLength }, (_, ci) => {
                      const day = row[ci];
                      return (
                        <span
                          key={ci}
                          className={`text-xs text-center py-2 border-r border-b border-fg/5 ${
                            day ? "text-fg/70" : "text-fg/10"
                          }`}
                        >
                          {day || ""}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-6">
        <form action={deleteCalendar.bind(null, id)}>
          <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">
            Delete Calendar
          </button>
        </form>
        <Link
          href="/world/calendar"
          className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
        >
          Back to Calendars
        </Link>
      </div>
    </main>
  );
}
