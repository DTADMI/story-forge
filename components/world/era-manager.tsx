"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { fetchJson, fetchVoid, getErrorMessage } from "@/lib/client-api";
import { useApiMutation, useApiQuery } from "@/lib/query-hooks";

interface Era {
  id: string;
  name: string;
  color?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface EraManagerProps {
  onChanged?: () => void;
}

export function EraManager({ onChanged }: EraManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["world", "eras"];
  const erasQuery = useApiQuery<Era[]>(queryKey, "/api/world/era");
  const eras = erasQuery.data ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const createEraMutation = useApiMutation<Era, Record<string, unknown>>("/api/world/era", {
    onSuccess: async () => {
      toast({ title: "Era created." });
      await queryClient.invalidateQueries({ queryKey });
      onChanged?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to save era",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
  const updateEraMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      fetchJson<Era>(`/api/world/era/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      toast({ title: "Era updated." });
      await queryClient.invalidateQueries({ queryKey });
      onChanged?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to save era",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
  const deleteEraMutation = useMutation({
    mutationFn: (id: string) => fetchVoid(`/api/world/era/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      toast({ title: "Era deleted" });
      await queryClient.invalidateQueries({ queryKey });
      onChanged?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete era",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  function resetForm() {
    setName("");
    setColor("#3b82f6");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const payload = {
      name: name.trim(),
      color,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    if (editingId) {
      await updateEraMutation.mutateAsync({ id: editingId, payload });
    } else {
      await createEraMutation.mutateAsync(payload);
    }

    resetForm();
    setShowForm(false);
  }

  if (erasQuery.isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-fg/10" />
        <div className="h-10 animate-pulse rounded bg-fg/5" />
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
            setShowForm((current) => !current);
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          <Plus className="h-3 w-3" />
          Add Era
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-fg/10 bg-bg p-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Era Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. The Golden Age"
              className="w-full rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Color</label>
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-8 w-full rounded border border-fg/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Start Date</label>
              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                placeholder="e.g. 0 AE"
                className="w-full rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">End Date</label>
              <input
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                placeholder="e.g. 1000 AE"
                className="w-full rounded-md border border-fg/20 bg-bg px-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-fg/20 px-3 py-1 text-xs hover:bg-fg/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createEraMutation.isPending || updateEraMutation.isPending}
              className="rounded-md bg-brand px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              {createEraMutation.isPending || updateEraMutation.isPending
                ? "Saving..."
                : editingId
                  ? "Update Era"
                  : "Create Era"}
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
              className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-fg/5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: era.color || "#3b82f6" }}
                />
                <span className="font-medium">{era.name}</span>
                {(era.startDate || era.endDate) && (
                  <span className="text-fg/40">
                    {era.startDate || "?"} - {era.endDate || "?"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(era.id);
                    setName(era.name);
                    setColor(era.color || "#3b82f6");
                    setStartDate(era.startDate || "");
                    setEndDate(era.endDate || "");
                    setShowForm(true);
                  }}
                  className="text-[10px] text-fg/30 hover:text-brand"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEraMutation.mutate(era.id)}
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
