import { cn } from "@/lib/utils";

interface AvatarProps {
  className?: string;
  src?: string;
  alt?: string;
  fallback?: string;
}

export function Avatar({ className, src, alt, fallback }: AvatarProps) {
  if (src) {
    return (
      <span
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center text-sm font-medium",
        className
      )}
    >
      {fallback?.slice(0, 2).toUpperCase() || "?"}
    </span>
  );
}
