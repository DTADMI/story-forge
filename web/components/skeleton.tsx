import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-fg/10 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="p-4 space-y-3 border border-fg/10 rounded-lg">
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList };
