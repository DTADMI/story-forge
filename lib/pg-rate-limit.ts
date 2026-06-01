import { createServerClient } from "@/lib/supabase/server";

type PgRateLimitResult = { allowed: boolean; remaining: number; resetAt: number };
type RateLimitConfig = { maxRequests: number; windowSeconds: number };

let _client: Awaited<ReturnType<typeof createServerClient>> | null = null;

async function getClient() {
  if (!_client) _client = await createServerClient();
  return _client;
}

async function pgRpc<T = unknown>(fn: string, params: Record<string, unknown>): Promise<T | null> {
  const supabase = await getClient();
  const { data, error } = (await (supabase as any).rpc(fn, params)) as {
    data: T | null;
    error: unknown;
  };
  if (error) return null;
  return data;
}

export async function checkPgRateLimit(
  identifier: string,
  config: RateLimitConfig,
  route = "default"
): Promise<PgRateLimitResult> {
  const data = await pgRpc<PgRateLimitResult>("check_rate_limit", {
    p_identifier: identifier,
    p_route: route,
    p_max_requests: config.maxRequests,
    p_window_seconds: config.windowSeconds,
  });
  if (!data)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: Math.floor(Date.now() / 1000) + config.windowSeconds,
    };
  return data;
}
