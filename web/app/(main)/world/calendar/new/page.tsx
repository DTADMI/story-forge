"use client";

import { Card } from "@/components/ui/card";
import { CalendarBuilder } from "@/components/world/calendar-builder";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewCalendarPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/calendar" className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">Create Calendar</h1>
      </div>

      <Card className="p-6">
        <CalendarBuilder />
      </Card>
    </main>
  );
}
