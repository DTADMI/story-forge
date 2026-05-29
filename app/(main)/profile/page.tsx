import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NextImage from "next/image";
import { AvatarUploadForm } from "./avatar-upload-form";
import { ScopeSelector } from "./scope-selector";
import { Settings, Award, Target, BookOpen, Users, Droplets } from "lucide-react";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      inkPot: true,
      _count: { select: { projects: true, characters: true, followers: true, following: true } },
    },
  });

  if (!profile) redirect("/signin");

  const settings = profile.settings as { defaultPublicationScope?: string } | null;
  const defaultScope = settings?.defaultPublicationScope || "PRIVATE";

  const stats = [
    { icon: BookOpen, value: profile._count.projects, label: "Projects", color: "text-primary" },
    { icon: Users, value: profile._count.characters, label: "Characters", color: "text-blue-500" },
    { icon: Users, value: profile._count.followers, label: "Followers", color: "text-purple-500" },
    { icon: Users, value: profile._count.following, label: "Following", color: "text-amber-500" },
    { icon: Droplets, value: profile.inkPot?.balance ?? 0, label: "Ink", color: "text-blue-500" },
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Profile</h1>
        <Link href="/profile/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1.5" /> Settings
          </Button>
        </Link>
      </div>

      {/* Avatar + Info */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            {profile.image ? (
              <NextImage
                src={profile.image}
                alt={profile.username || "Avatar"}
                width={88}
                height={88}
                unoptimized
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-1 to-brand-3 flex items-center justify-center text-white text-2xl font-display font-bold">
                {(profile.name || profile.username || "W").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="mt-2">
              <AvatarUploadForm userId={profile.id} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold">
              {profile.name || profile.username || "Writer"}
            </h2>
            {profile.username && (
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            )}
            {profile.bio && <p className="text-sm mt-2 text-muted-foreground">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                {profile.website}
              </a>
            )}
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary">{profile.subscriptionStatus || "Free"}</Badge>
              {profile.role !== "reader" && <Badge variant="outline">{profile.role}</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
            <p className={`font-display text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/profile/badges">
          <Card className="p-4 text-center hover:border-primary/30 transition-colors">
            <Award className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-sm font-medium">Badges</p>
          </Card>
        </Link>
        <Link href="/goals">
          <Card className="p-4 text-center hover:border-primary/30 transition-colors">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-sm font-medium">Goals</p>
          </Card>
        </Link>
        <Link href="/social/followers">
          <Card className="p-4 text-center hover:border-primary/30 transition-colors">
            <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-sm font-medium">Followers</p>
          </Card>
        </Link>
        <Link href="/social/following">
          <Card className="p-4 text-center hover:border-primary/30 transition-colors">
            <Users className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-sm font-medium">Following</p>
          </Card>
        </Link>
      </div>

      {/* Default Scope */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Default Publication Scope</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Controls visibility of new projects
            </p>
          </div>
          <ScopeSelector userId={profile.id} currentScope={defaultScope} />
        </div>
      </Card>
    </div>
  );
}
