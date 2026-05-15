"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface Month {
  name: string;
  days: number;
  orderIndex: number;
}

interface CalendarBuilderProps {
  onSave?: (data: { name: string; weekLength: number; months: Month[] }) => void;
}

export function CalendarBuilder({ onSave }: CalendarBuilderProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [weekLength, setWeekLength] = useState(7);
  const [months, setMonths] = useState<Month[]>([{ name: "First Month", days: 30, orderIndex: 0 }]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  function addMonth() {
    setMonths((prev) => [
      ...prev,
      { name: `Month ${prev.length + 1}`, days: 30, orderIndex: prev.length },
    ]);
  }

  function removeMonth(index: number) {
    setMonths((prev) =>
      prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, orderIndex: i }))
    );
  }

  function moveMonth(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= months.length) return;
    setMonths((prev) => {
      const updated = [...prev];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated.map((m, i) => ({ ...m, orderIndex: i }));
    });
  }

  function updateMonth(index: number, field: keyof Month, value: string | number) {
    setMonths((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "Calendar name is required", variant: "destructive" });
      return;
    }
    if (months.length === 0) {
      toast({ title: "At least one month is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        onSave({ name: name.trim(), weekLength, months });
        return;
      }
      const res = await fetch("/api/world/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), weekLength, months }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Calendar created!" });
      window.location.href = "/world/calendar";
    } catch {
      toast({ title: "Failed to save calendar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const weekDays = Array.from({ length: weekLength }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Calendar Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Elven Calendar"
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Days per Week</label>
          <input
            type="number"
            value={weekLength}
            onChange={(e) => setWeekLength(Math.max(1, Math.min(14, Number(e.target.value))))}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            min={1}
            max={14}
          />
        </div>
      </div>

      {/* Months Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Months</label>
          <button
            onClick={addMonth}
            className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline"
          >
            <Plus className="h-3 w-3" />
            Add Month
          </button>
        </div>

        <div className="space-y-2">
          {months.map((month, index) => (
            <div
              key={index}
              className="flex items-center gap-2 border border-fg/10 rounded-lg p-2 bg-bg"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveMonth(index, "up")}
                  disabled={index === 0}
                  className="p-0.5 rounded hover:bg-fg/5 disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => moveMonth(index, "down")}
                  disabled={index === months.length - 1}
                  className="p-0.5 rounded hover:bg-fg/5 disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
              <span className="text-xs text-fg/30 w-5 text-center">#{index + 1}</span>
              <input
                value={month.name}
                onChange={(e) => updateMonth(index, "name", e.target.value)}
                className="flex-1 rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
                placeholder="Month name"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={month.days}
                  onChange={(e) =>
                    updateMonth(index, "days", Math.max(1, Math.min(60, Number(e.target.value))))
                  }
                  className="w-16 rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
                  min={1}
                  max={60}
                />
                <span className="text-xs text-fg/40">days</span>
              </div>
              <button
                onClick={() => removeMonth(index)}
                className="p-1 rounded hover:bg-red-500/10 text-fg/40 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="text-xs text-brand font-medium hover:underline"
      >
        {showPreview ? "Hide Preview" : "Show Preview"}
      </button>

      {showPreview && (
        <div className="border border-fg/10 rounded-lg p-4 bg-bg">
          <h3 className="text-sm font-bold mb-3">Calendar Preview &mdash; {name || "Unnamed"}</h3>
          <div className="grid gap-4">
            {months.map((month) => {
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
                <div key={month.orderIndex}>
                  <h4 className="text-xs font-bold mb-1">{month.name}</h4>
                  <div className="border border-fg/10 rounded overflow-hidden">
                    {/* Header row */}
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${weekLength}, 1fr)` }}>
                      {weekDays.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] text-fg/40 text-center py-1 border-b border-fg/10 bg-fg/5"
                        >
                          D{d}
                        </span>
                      ))}
                    </div>
                    {/* Days */}
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
                              className={`text-[10px] text-center py-0.5 border-r border-b border-fg/5 ${
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Calendar"}
        </button>
      </div>
    </div>
  );
}
