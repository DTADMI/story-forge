"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

export function ScopeSelector({ userId, currentScope }: { userId: string; currentScope: string }) {
  const [scope, setScope] = useState(currentScope);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newScope = e.target.value;
    setScope(newScope);
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultPublicationScope: newScope }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Default scope updated" });
    } catch {
      setScope(currentScope);
      toast({ title: "Failed to update scope", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={scope}
      onChange={handleChange}
      disabled={saving}
      className="border border-fg/20 rounded-md px-3 py-1.5 text-sm bg-bg disabled:opacity-50"
    >
      <option value="PRIVATE">Private</option>
      <option value="FRIENDS">Friends</option>
      <option value="PUBLIC_AUTHENTICATED">Public (Authenticated)</option>
      <option value="PUBLIC_ANYONE">Public (Anyone)</option>
    </select>
  );
}
