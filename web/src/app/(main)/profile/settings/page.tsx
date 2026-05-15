import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function ProfileSettingsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!profile) redirect("/signin");

  const settings = (profile.settings as Record<string, unknown>) ?? {};
  const defaultScope = (settings.defaultPublicationScope as string) || "PRIVATE";
  const breakReminders = (settings.breakReminders as boolean) ?? false;
  const writingCap = (settings.writingCap as number) ?? null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Profile Settings</h1>
      <SettingsForm
        userId={profile.id}
        initialName={profile.name ?? ""}
        initialUsername={profile.username ?? ""}
        initialBio={profile.bio ?? ""}
        initialWebsite={profile.website ?? ""}
        initialDefaultScope={defaultScope}
        initialBreakReminders={breakReminders}
        initialWritingCap={writingCap}
      />
    </main>
  );
}
