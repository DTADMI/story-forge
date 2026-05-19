import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AvatarDefault } from "@/components/assets/avatar-default";
import { Card } from "@/components/ui/card";
import NextImage from "next/image";
import { AvatarUploadForm } from "./avatar-upload-form";
import { ScopeSelector } from "./scope-selector";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      inkPot: true,
      _count: {
        select: {
          projects: true,
          characters: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!profile) redirect("/signin");

  const settings = profile.settings as { defaultPublicationScope?: string } | null;
  const defaultScope = settings?.defaultPublicationScope || "PRIVATE";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-extrabold">Your Profile</h1>

      {/* Avatar section */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {profile.image ? (
              <NextImage
                src={profile.image}
                alt={profile.username || "Avatar"}
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 rounded-full object-cover border-2 border-fg/10"
              />
            ) : (
              <AvatarDefault className="h-20 w-20" size={80} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile.name || profile.username || "Writer"}</h2>
            {profile.username && <p className="text-sm text-fg/50">@{profile.username}</p>}
            {profile.bio && <p className="text-sm mt-1 text-fg/70">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand hover:underline mt-0.5 inline-block"
              >
                {profile.website}
              </a>
            )}
          </div>
          <AvatarUploadForm userId={profile.id} />
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-2xl font-extrabold">{profile._count.projects}</p>
            <p className="text-xs text-fg/50">Projects</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{profile._count.characters}</p>
            <p className="text-xs text-fg/50">Characters</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{profile._count.followers}</p>
            <p className="text-xs text-fg/50">Followers</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{profile._count.following}</p>
            <p className="text-xs text-fg/50">Following</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{profile.inkPot?.balance ?? 0}</p>
            <p className="text-xs text-fg/50">Ink</p>
          </div>
        </div>
      </Card>

      {/* Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/profile/settings"
          className="border border-fg/15 rounded-lg p-3 text-center text-sm hover:bg-fg/5 transition-colors"
        >
          Settings
        </Link>
        <Link
          href="/profile/badges"
          className="border border-fg/15 rounded-lg p-3 text-center text-sm hover:bg-fg/5 transition-colors"
        >
          Badges
        </Link>
        <Link
          href="/goals"
          className="border border-fg/15 rounded-lg p-3 text-center text-sm hover:bg-fg/5 transition-colors"
        >
          Goals
        </Link>
        <div className="border border-fg/15 rounded-lg p-3 text-center text-sm">
          <span className="text-fg/50">Subscription: </span>
          <span className="font-medium capitalize">{profile.subscriptionStatus || "Free"}</span>
        </div>
      </div>

      {/* Default publication scope */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Default Publication Scope</h3>
            <p className="text-xs text-fg/40 mt-0.5">Controls visibility of new projects</p>
          </div>
          <ScopeSelector userId={profile.id} currentScope={defaultScope} />
        </div>
      </Card>
    </main>
  );
}
