"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { Card } from "@/components/ui/card";

interface SettingsFormProps {
  userId: string;
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialWebsite: string;
  initialDefaultScope: string;
  initialBreakReminders: boolean;
  initialWritingCap: number | null;
}

export function SettingsForm({
  userId,
  initialName,
  initialUsername,
  initialBio,
  initialWebsite,
  initialDefaultScope,
  initialBreakReminders,
  initialWritingCap,
}: SettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [website, setWebsite] = useState(initialWebsite);
  const [defaultScope, setDefaultScope] = useState(initialDefaultScope);
  const [breakReminders, setBreakReminders] = useState(initialBreakReminders);
  const [writingCap, setWritingCap] = useState(initialWritingCap?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          username: username || null,
          bio: bio || null,
          website: website || null,
          defaultPublicationScope: defaultScope,
          breakReminders,
          writingCap: writingCap ? Number(writingCap) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Settings saved!" });
      router.refresh();
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold">Profile</h2>

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            type="url"
            placeholder="https://"
            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Default Publication Scope</label>
          <select
            value={defaultScope}
            onChange={(e) => setDefaultScope(e.target.value)}
            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          >
            <option value="PRIVATE">Private</option>
            <option value="FRIENDS">Friends</option>
            <option value="PUBLIC_AUTHENTICATED">Public (Authenticated)</option>
            <option value="PUBLIC_ANYONE">Public (Anyone)</option>
          </select>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold">Wellbeing & Focus</h2>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={breakReminders}
            onChange={(e) => setBreakReminders(e.target.checked)}
            className="rounded border-fg/20"
          />
          <span className="text-sm">Enable Break Reminders</span>
        </label>

        <div>
          <label className="block text-sm font-medium">Daily Writing Cap (words)</label>
          <input
            type="number"
            min={0}
            value={writingCap}
            onChange={(e) => setWritingCap(e.target.value)}
            placeholder="e.g. 2000"
            className="mt-1 w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
      </Card>

      <button
        type="submit"
        disabled={saving}
        className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
