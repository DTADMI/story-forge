import { SkeletonList } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <div className="h-8 w-48 bg-fg/10 animate-pulse rounded" />
      <div className="grid md:grid-cols-2 gap-8">
        <SkeletonList count={3} />
        <SkeletonList count={3} />
      </div>
    </div>
  );
}
