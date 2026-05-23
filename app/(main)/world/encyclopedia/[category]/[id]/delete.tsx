"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";
import { useApiMutation } from "@/lib/query-hooks";

export function EncyclopediaEntryDelete({
  entryId,
  category,
}: {
  entryId: string;
  category: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const deleteEntry = useApiMutation<unknown, void>(`/api/world/encyclopedia/${entryId}`, {
    method: "DELETE",
    onSuccess: () => {
      toast({ title: "Entry deleted" });
      router.push(`/world/encyclopedia/${category}`);
      router.refresh();
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  function handleDelete() {
    deleteEntry.mutate(undefined);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Are you sure?</span>
        <button onClick={handleDelete} className="px-2 py-1 text-xs bg-red-600 text-white rounded">
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs border border-fg/20 rounded"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
    >
      Delete
    </button>
  );
}
