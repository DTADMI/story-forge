import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Plus, BookOpen, Lock, Globe, Users, Eye } from "lucide-react";

const scopeIcons: Record<string, typeof Lock> = {
  PRIVATE: Lock,
  FRIENDS: Users,
  PUBLIC_AUTHENTICATED: Eye,
  PUBLIC_ANYONE: Globe,
};

export default async function ProjectsPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      wordCount: true,
      genre: true,
      defaultScope: true,
      updatedAt: true,
    },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-1.5" /> New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Start writing your first story."
          action={{ label: "Create Project", href: "/projects/new" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => {
            const Icon = scopeIcons[p.defaultScope] || Lock;
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-display font-semibold line-clamp-1">{p.title}</h2>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {p.wordCount?.toLocaleString() || 0} words
                    </span>
                    {p.genre && (
                      <span className="border border-border rounded px-1.5 py-0.5">{p.genre}</span>
                    )}
                    <span className="ml-auto">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
