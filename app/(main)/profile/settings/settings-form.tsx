"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

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
  const { toast } = useToast();
  const router = useRouter();
  const saveSettingsMutation = useApiMutation<unknown, Record<string, unknown>>(
    `/api/users/${userId}`,
    {
      method: "PATCH",
      onSuccess: () => {
        toast({ title: "Settings saved." });
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: "Failed to save settings",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await saveSettingsMutation.mutateAsync({
          name: name || null,
          username: username || null,
          bio: bio || null,
          website: website || null,
          defaultPublicationScope: defaultScope,
          breakReminders,
          writingCap: writingCap ? Number(writingCap) : null,
        });
      }}
      className="space-y-6"
    >
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-bold">Profile</h2>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Website</label>
          <input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            type="url"
            placeholder="https://"
            className="mt-1 w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Default Publication Scope</label>
          <select
            value={defaultScope}
            onChange={(event) => setDefaultScope(event.target.value)}
            className="mt-1 w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          >
            <option value="PRIVATE">Private</option>
            <option value="FRIENDS">Friends</option>
            <option value="PUBLIC_AUTHENTICATED">Public (Authenticated)</option>
            <option value="PUBLIC_ANYONE">Public (Anyone)</option>
          </select>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-bold">Wellbeing & Focus</h2>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={breakReminders}
            onChange={(event) => setBreakReminders(event.target.checked)}
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
            onChange={(event) => setWritingCap(event.target.value)}
            placeholder="e.g. 2000"
            className="mt-1 w-full rounded-md border border-fg/20 bg-bg px-3 py-2 text-sm"
          />
        </div>
      </Card>

      <button
        type="submit"
        disabled={saveSettingsMutation.isPending}
        className="rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
      >
        {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
