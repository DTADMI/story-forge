import { createServerClient } from "@/lib/supabase/server";

const flagCache = new Map<string, boolean>();
let lastCacheRefresh = 0;
const CACHE_TTL_MS = 2_000;

let _client: Awaited<ReturnType<typeof createServerClient>> | null = null;

async function getClient() {
  if (!_client) _client = await createServerClient();
  return _client;
}

export async function isPgFlagEnabled(flagName: string): Promise<boolean> {
  try {
    if (Date.now() - lastCacheRefresh < CACHE_TTL_MS && flagCache.has(flagName))
      return flagCache.get(flagName)!;
    const supabase = await getClient();
    const { data } = await (supabase as any)
      .from("feature_flags")
      .select("enabled")
      .eq("name", flagName)
      .maybeSingle();
    const enabled = data?.enabled ?? false;
    flagCache.set(flagName, enabled);
    lastCacheRefresh = Date.now();
    return enabled;
  } catch {
    return false;
  }
}

export async function setPgFeatureFlag(
  name: string,
  enabled: boolean,
  value?: unknown
): Promise<void> {
  const supabase = await getClient();
  await (supabase as any)
    .from("feature_flags")
    .upsert(
      { name, enabled, value: value ?? enabled, updated_at: new Date().toISOString() },
      { onConflict: "name" }
    );
  flagCache.delete(name);
  lastCacheRefresh = 0;
}

export async function refreshPgFlagsCache(): Promise<void> {
  flagCache.clear();
  lastCacheRefresh = 0;
  const supabase = await getClient();
  const { data } = await (supabase as any).from("feature_flags").select("name,enabled");
  if (data) {
    for (const f of data as Array<{ name: string; enabled: boolean }>)
      flagCache.set(f.name, f.enabled);
    lastCacheRefresh = Date.now();
  }
}
