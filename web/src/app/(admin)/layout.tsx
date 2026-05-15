import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect("/signin");

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-fg/10 bg-fg/3 p-4 space-y-2 shrink-0">
        <h2 className="text-sm font-bold text-fg/50 uppercase tracking-wide mb-4">Admin</h2>
        <AdminNav href="/admin/dashboard" label="Dashboard" />
        <AdminNav href="/admin/flags" label="Feature Flags" />
        <AdminNav href="/admin/users" label="Users" />
        <AdminNav href="/admin/moderation" label="Moderation" />
        <AdminNav href="/admin/audit" label="Audit Log" />
        <hr className="border-fg/10 my-4" />
        <Link href="/dashboard" className="text-xs text-fg/40 hover:text-brand block">
          ← Back to app
        </Link>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function AdminNav({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-1.5 text-sm rounded-md hover:bg-fg/5 text-fg/70 hover:text-fg transition-colors"
    >
      {label}
    </Link>
  );
}
