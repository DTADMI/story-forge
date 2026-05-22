import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {icon || <FolderOpen className="h-7 w-7 text-muted-foreground/50" />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex rounded-md bg-gradient-to-r from-brand-1 to-brand-2 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-2/20 hover:shadow-md hover:shadow-brand-2/25 transition-all duration-200 hover:-translate-y-0.5"
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  );
}
