function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-md bg-fg/10 ${className || ""}`} style={style} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border border-fg/10 p-4 space-y-3">
      <Pulse className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Pulse
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-1/2" : "w-full"}`}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-fg/10 p-3">
          <Pulse className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3.5 w-1/3" style={{ animationDelay: `${i * 100}ms` }} />
            <Pulse className="h-3 w-2/3" style={{ animationDelay: `${i * 100 + 50}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Pulse className="h-3.5 w-1/4" />
          <Pulse className="h-9 w-full rounded-md" style={{ animationDelay: `${i * 75}ms` }} />
        </div>
      ))}
      <Pulse className="h-10 w-24 rounded-md" />
    </div>
  );
}
