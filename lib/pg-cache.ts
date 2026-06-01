import { createServerClient } from "@/lib/supabase/server";

const DEFAULT_TTL = 300;

let _client: Awaited<ReturnType<typeof createServerClient>> | null = null;

async function getClient() {
  if (!_client) _client = await createServerClient();
  return _client;
}

export async function pgGetCached<T>(key: string): Promise<T | null> {
  try {
    const supabase = await getClient();
    const { data } = await (supabase as any)
      .from("app_cache")
      .select("value")
      .eq("key", key)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function pgSetCached<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL
): Promise<void> {
  try {
    const supabase = await getClient();
    await (supabase as any).from("app_cache").upsert(
      {
        key,
        value: JSON.parse(JSON.stringify(value)),
        expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.error("[pg-cache] set error:", err);
  }
}

export async function pgDeleteCached(key: string): Promise<void> {
  try {
    const supabase = await getClient();
    await (supabase as any).from("app_cache").delete().eq("key", key);
  } catch (err) {
    console.error("[pg-cache] delete error:", err);
  }
}
