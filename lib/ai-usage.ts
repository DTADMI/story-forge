/**
 * AI usage tracking — Redis-backed daily quota tracking.
 * Enforces subscription-tier limits and provides usage stats.
 */
import { getRedis } from "@/lib/redis";
import { getAILimit } from "@/lib/permissions";
import type { AiFeature, AiUsageRecord } from "@/lib/ai-types";

const USAGE_KEY_PREFIX = "storyforge:ai:usage";
const RATE_LIMIT_KEY = "storyforge:ai:user_rate";

function formatDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function buildUsageKey(userId: string, date: string): string {
  return `${USAGE_KEY_PREFIX}:${userId}:${date}`;
}

function buildRateLimitKey(userId: string): string {
  return `${RATE_LIMIT_KEY}:${userId}`;
}

export async function trackAiUsage(
  userId: string,
  subscriptionTier: string,
  feature: AiFeature
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = getAILimit(subscriptionTier);
  const today = formatDateKey();

  // Free tier — no AI access
  if (limit === 0) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  try {
    const redis = getRedis();
    const key = buildUsageKey(userId, today);
    const count = ((await redis.get(key)) as number) ?? 0;

    if (count >= limit) {
      return { allowed: false, remaining: 0, limit };
    }

    // Log the feature type for analytics
    const featureKey = `${key}:feature:${feature}`;
    await redis.incr(featureKey);

    // Increment daily count with 25-hour TTL (handles timezone edge cases)
    await redis.incr(key);
    const ttl = 25 * 60 * 60;
    await redis.expire(key, ttl);
    if (count === 0) {
      await redis.expire(featureKey, ttl);
    }

    const remaining = limit - (count as number) - 1;
    return { allowed: true, remaining, limit };
  } catch {
    // Redis unavailable — fail open
    return { allowed: true, remaining: limit, limit };
  }
}

export async function getAiUsage(userId: string, subscriptionTier: string): Promise<AiUsageRecord> {
  const limit = getAILimit(subscriptionTier);
  const today = formatDateKey();

  try {
    const redis = getRedis();
    const key = buildUsageKey(userId, today);
    const count = ((await redis.get(key)) as number) ?? 0;
    return {
      date: today,
      count: count as number,
      remaining: Math.max(0, limit - (count as number)),
      limit,
    };
  } catch {
    return { date: today, count: 0, remaining: limit, limit };
  }
}

export async function getAiUsageByFeature(
  userId: string,
  date?: string
): Promise<Record<AiFeature, number>> {
  const dayStr = date ?? formatDateKey();

  try {
    const redis = getRedis();
    const baseKey = buildUsageKey(userId, dayStr);
    const features: AiFeature[] = ["suggest", "character", "plot", "style", "research"];
    const result: Record<AiFeature, number> = {
      suggest: 0,
      character: 0,
      plot: 0,
      style: 0,
      research: 0,
    };

    for (const feature of features) {
      const val = ((await redis.get(`${baseKey}:feature:${feature}`)) as number) ?? 0;
      result[feature] = val as number;
    }

    return result;
  } catch {
    return { suggest: 0, character: 0, plot: 0, style: 0, research: 0 };
  }
}

export async function checkUserRateLimit(
  userId: string,
  maxPerMinute = 10
): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    const redis = getRedis();
    const key = buildRateLimitKey(userId);
    const count = ((await redis.get(key)) as number) ?? 0;

    if (count >= maxPerMinute) {
      const ttl = ((await redis.ttl(key)) as number) ?? 60;
      return { allowed: false, retryAfter: Math.max(1, ttl) };
    }

    if (count === 0) {
      await redis.set(key, 1, { ex: 60 });
    } else {
      await redis.incr(key);
    }

    return { allowed: true, retryAfter: 0 };
  } catch {
    return { allowed: true, retryAfter: 0 };
  }
}

export async function resetAiUsage(userId: string): Promise<void> {
  try {
    const redis = getRedis();
    const today = formatDateKey();
    const baseKey = buildUsageKey(userId, today);

    await redis.del(baseKey);
    const features: AiFeature[] = ["suggest", "character", "plot", "style", "research"];
    for (const feature of features) {
      await redis.del(`${baseKey}:feature:${feature}`);
    }
  } catch {
    // Redis unavailable — nothing to do
  }
}
