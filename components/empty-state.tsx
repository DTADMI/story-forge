import { ReactNode } from "react";
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fg/5">
        {icon || <FolderOpen className="h-6 w-6 text-fg/30" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-fg/40 mt-1 max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex px-4 py-2 text-sm font-medium bg-brand text-white rounded-md hover:bg-brand/90"
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  );
}
