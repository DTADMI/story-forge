"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { Plus, Trash2 } from "lucide-react";

interface EraManagerProps {
  onChanged?: () => void;
}

export function EraManager({ onChanged }: EraManagerProps) {
  const { toast } = useToast();
  const [eras, setEras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function fetchEras() {
    try {
      const res = await fetch("/api/world/era");
      if (res.ok) setEras(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    fetchEras();
  });

  function resetForm() {
    setName("");
    setColor("#3b82f6");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
  }

  function startEdit(era: any) {
    setEditingId(era.id);
    setName(era.name);
    setColor(era.color || "#3b82f6");
    setStartDate(era.startDate || "");
    setEndDate(era.endDate || "");
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        color,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      if (editingId) {
        const res = await fetch(`/api/world/era/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed");
        toast({ title: "Era updated!" });
      } else {
        const res = await fetch("/api/world/era", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed");
        toast({ title: "Era created!" });
      }
      resetForm();
      setShowForm(false);
      fetchEras();
      onChanged?.();
    } catch {
      toast({ title: "Failed to save era", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/world/era/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Era deleted" });
      fetchEras();
      onChanged?.();
    } catch {
      toast({ title: "Failed to delete era", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-24 bg-fg/10 animate-pulse rounded" />
        <div className="h-10 bg-fg/5 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Eras</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline"
        >
          <Plus className="h-3 w-3" />
          Add Era
        </button>
      </div>

      {showForm && (
        <div className="border border-fg/10 rounded-lg p-3 space-y-3 bg-bg">
          <div>
            <label className="block text-xs font-medium mb-1">Era Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Golden Age"
              className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 rounded border border-fg/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Start Date</label>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. 0 AE"
                className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">End Date</label>
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="e.g. 1000 AE"
                className="w-full rounded-md border border-fg/20 px-2 py-1.5 text-xs bg-bg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-xs border border-fg/20 rounded-md hover:bg-fg/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 text-xs bg-brand text-white rounded-md disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Era" : "Create Era"}
            </button>
          </div>
        </div>
      )}

      {eras.length === 0 && !showForm ? (
        <p className="text-xs text-fg/40">No eras defined yet.</p>
      ) : (
        <ul className="space-y-1">
          {eras.map((era) => (
            <li
              key={era.id}
              className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-fg/5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: era.color || "#3b82f6" }}
                />
                <span className="font-medium">{era.name}</span>
                {(era.startDate || era.endDate) && (
                  <span className="text-fg/40">
                    {era.startDate || "?"} — {era.endDate || "?"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(era)}
                  className="text-fg/30 hover:text-brand text-[10px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(era.id)}
                  className="text-fg/30 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
