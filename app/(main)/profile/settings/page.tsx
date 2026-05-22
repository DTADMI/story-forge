import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { settings: true },
  });

  const s = (profile?.settings as Record<string, unknown>) || {};

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Settings</h1>
      <Card className="p-6">
        <SettingsForm
          userId={user.id}
          initialName={(user.user_metadata?.name as string) || ""}
          initialUsername={(user.user_metadata?.username as string) || ""}
          initialBio={(s.bio as string) || ""}
          initialWebsite={(s.website as string) || ""}
          initialDefaultScope={(s.defaultPublicationScope as string) || "PRIVATE"}
          initialBreakReminders={(s.breakReminders as boolean) || false}
          initialWritingCap={(s.writingCap as number) || null}
        />
      </Card>
    </div>
  );
}
