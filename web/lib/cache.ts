/**
 * Cache helper for Redis-backed caching in StoryForge.
 * Uses Upstash Redis with graceful fallback.
 */
import { getRedis } from "./redis";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw as string) as T;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch {
    // Cache write failures are non-fatal
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Non-fatal
  }
}

export function buildCacheKey(...parts: string[]): string {
  return `storyforge:${parts.join(":")}`;
}
