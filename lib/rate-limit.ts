/**
 * Rate limiting for StoryForge API routes.
 * Supports PG-based rate limiting via PG_RATE_LIMIT env var.
 * Falls back to Upstash Redis with token-bucket algorithm.
 */
import { getRedis } from "./redis";
import { checkPgRateLimit } from "./pg-rate-limit";

const USE_PG = process.env.PG_RATE_LIMIT === "true";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
}

const WINDOW_SECONDS = 60; // 1 minute sliding window

/**
 * Check rate limit for a given key (e.g., "api:projects:user-123").
 * Returns whether the request is allowed, remaining count, and reset time.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds = WINDOW_SECONDS
): Promise<RateLimitResult> {
  if (USE_PG) {
    return checkPgRateLimit(key, { maxRequests, windowSeconds });
  }

  try {
    const redis = getRedis();
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    await redis.zremrangebyscore(key, 0, windowStart);
    const count = (await redis.zcard(key)) as number;

    if (count >= maxRequests) {
      const oldest = (await redis.zrange(key, 0, 0, { withScores: true })) as [string, number][];
      const resetAt =
        oldest.length > 0 ? Math.ceil(oldest[0][1]) + windowSeconds : now + windowSeconds;
      return { allowed: false, remaining: 0, resetAt };
    }

    await redis.zadd(key, {
      score: now,
      member: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    });
    await redis.expire(key, windowSeconds + 1);

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetAt: now + windowSeconds,
    };
  } catch {
    return { allowed: true, remaining: maxRequests, resetAt: 0 };
  }
}

/**
 * Higher-order function: wraps an API route handler with rate limiting.
 *
 * @example
 * export const POST = withRateLimit(async (request) => {
 *   const user = await requireUser();
 *   // ... handler logic
 * }, { maxRequests: 60, keyPrefix: "api:ai:suggest" });
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withRateLimit<T extends (request: Request, ...args: any[]) => Promise<Response>>(
  handler: T,
  options: { maxRequests: number; keyPrefix: string; windowSeconds?: number }
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (async (request: Request, ...args: any[]) => {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
    const key = `${options.keyPrefix}:${ip}`;

    const result = await checkRateLimit(key, options.maxRequests, options.windowSeconds);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: result.resetAt - Math.floor(Date.now() / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(1, result.resetAt - Math.floor(Date.now() / 1000))),
          },
        }
      );
    }

    return handler(request, ...args);
  }) as T;
}

/**
 * Pre-configured rate limit tiers
 */
export const RateLimitTiers = {
  /** Auth endpoints (sign in, sign up) */
  AUTH: { maxRequests: 10, keyPrefix: "rate:auth" },
  /** AI generation (expensive) */
  AI: { maxRequests: 30, keyPrefix: "rate:ai" },
  /** Standard write operations */
  WRITE: { maxRequests: 60, keyPrefix: "rate:write" },
  /** Standard read operations */
  READ: { maxRequests: 300, keyPrefix: "rate:read" },
  /** Public/unauth endpoints */
  PUBLIC: { maxRequests: 100, keyPrefix: "rate:public" },
} as const;
