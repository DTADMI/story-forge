import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/flags-server";

export const revalidate = 300;

export default async function PublicFeedPage() {
  if (!(await isEnabled("public_feed"))) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">Public Feed</h1>
        <p className="text-muted-foreground mt-2">The public feed is currently unavailable.</p>
      </main>
    );
  }

  const projects = await prisma.project.findMany({
    where: { OR: [{ isPublic: true }, { defaultScope: "PUBLIC_ANYONE" }] },
    include: { user: { select: { name: true, username: true, image: true } } },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">Public Stories Feed</h1>
        <p className="text-[color:var(--fg)]/70">Stories shared with scope: public-anyone</p>
      </header>
      {projects.length === 0 ? (
        <div className="rounded-lg border border-[color:var(--fg)]/15 p-6 text-center">
          <p className="text-sm text-[color:var(--fg)]/70">
            No public stories yet. Be the first to share! ✨
          </p>
          <div className="mt-3 text-sm">
            <a href="/signin" className="underline">
              Sign in
            </a>{" "}
            to start a project.
          </div>
        </div>
      ) : (
        <ul className="grid gap-4">
          {projects.map((p) => (
            <li key={p.id} className="rounded-lg border border-[color:var(--fg)]/15 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{p.title}</h2>
                <span className="text-xs tracking-wide text-[color:var(--fg)]/50 uppercase">
                  {p.defaultScope}
                </span>
              </div>
              <p className="mt-1 text-sm text-[color:var(--fg)]/80">
                by {p.user.username || p.user.name || "Anonymous"}
              </p>
              <p className="mt-2 text-sm">{p.description ?? "No description yet."}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
