// PG LISTEN/NOTIFY listener — flushes caches on feature flag changes
// Uses Supabase Realtime (Postgres Changes)
import { createServerClient } from "@/lib/supabase/server";

type CacheFlushCallback = () => void;
const flushCallbacks: CacheFlushCallback[] = [];
let unsubscribeFn: (() => void) | null = null;

export function registerFlushCallback(cb: CacheFlushCallback): () => void {
  flushCallbacks.push(cb);
  return () => {
    const idx = flushCallbacks.indexOf(cb);
    if (idx >= 0) flushCallbacks.splice(idx, 1);
  };
}

async function flushAllCaches(): Promise<void> {
  for (const cb of flushCallbacks) {
    try {
      cb();
    } catch {
      /* Realtime optional: caches expire via TTL */
    }
  }
}

export async function startFlagListener(): Promise<void> {
  if (unsubscribeFn) return;
  try {
    const supabase = await createServerClient();
    const channel = supabase
      .channel("feature-flags-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "feature_flags" }, () => {
        flushAllCaches().catch(() => {
          return;
        });
      })
      .subscribe();
    unsubscribeFn = () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  } catch {
    return;
  }
}

export function stopFlagListener(): void {
  if (unsubscribeFn) {
    unsubscribeFn();
    unsubscribeFn = null;
  }
}
export function isListenerActive(): boolean {
  return unsubscribeFn !== null;
}
