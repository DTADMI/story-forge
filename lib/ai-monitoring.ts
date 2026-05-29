/**
 * AI monitoring — tracks latency, success rate, and per-feature metrics.
 * Data stored in Redis with 7-day TTL for dashboard visualization.
 */
import { getRedis } from "@/lib/redis";
import type { AiFeature } from "@/lib/ai-types";

const MONITORING_KEY = "storyforge:ai:monitor";
const TTL = 7 * 24 * 60 * 60; // 7 days

export interface AiRequestMetric {
  feature: AiFeature;
  latencyMs: number;
  success: boolean;
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  timestamp: number;
}

export interface AiMetricsSummary {
  totalRequests: number;
  successRate: number;
  avgLatencyMs: number;
  totalTokens: number;
  byFeature: Record<
    AiFeature,
    {
      requests: number;
      successRate: number;
      avgLatencyMs: number;
    }
  >;
  recentRequests: AiRequestMetric[];
}

function getMetricsKey(date?: string): string {
  const day = date ?? new Date().toISOString().slice(0, 10);
  return `${MONITORING_KEY}:metrics:${day}`;
}

function getRecentKey(): string {
  return `${MONITORING_KEY}:recent`;
}

export async function recordAiRequest(metric: AiRequestMetric): Promise<void> {
  try {
    const redis = getRedis();
    const day = new Date(metric.timestamp).toISOString().slice(0, 10);
    const metricsKey = getMetricsKey(day);

    // Store metric in a sorted set keyed by timestamp
    const member = JSON.stringify(metric);
    await redis.zadd(metricsKey, { score: metric.timestamp, member });
    await redis.expire(metricsKey, TTL);

    // Store in recent requests list (last 100)
    await redis.lpush(getRecentKey(), member);
    await redis.ltrim(getRecentKey(), 0, 99);
    await redis.expire(getRecentKey(), TTL);

    // Increment feature-specific counters
    const featureKey = `${MONITORING_KEY}:feature:${day}:${metric.feature}`;
    await redis.hincrby(featureKey, "requests", 1);
    if (metric.success) await redis.hincrby(featureKey, "successes", 1);
    await redis.hincrby(featureKey, "totalLatency", metric.latencyMs);
    await redis.hincrby(featureKey, "totalTokens", metric.tokensInput + metric.tokensOutput);
    await redis.expire(featureKey, TTL);

    // Increment global counters
    const globalKey = `${MONITORING_KEY}:global:${day}`;
    await redis.hincrby(globalKey, "requests", 1);
    if (metric.success) await redis.hincrby(globalKey, "successes", 1);
    await redis.hincrby(globalKey, "totalLatency", metric.latencyMs);
    await redis.hincrby(globalKey, "totalTokens", metric.tokensInput + metric.tokensOutput);
    await redis.expire(globalKey, TTL);
  } catch {
    // Non-critical — fail silently
  }
}

export async function getAiMetrics(daysBack = 7): Promise<AiMetricsSummary> {
  try {
    const redis = getRedis();
    const features: AiFeature[] = ["suggest", "character", "plot", "style", "research"];
    const days: string[] = [];

    for (let i = 0; i < daysBack; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    let totalRequests = 0;
    let totalSuccesses = 0;
    let totalLatency = 0;
    let totalTokens = 0;

    const byFeature: Record<
      AiFeature,
      { requests: number; successRate: number; avgLatencyMs: number }
    > = {
      suggest: { requests: 0, successRate: 0, avgLatencyMs: 0 },
      character: { requests: 0, successRate: 0, avgLatencyMs: 0 },
      plot: { requests: 0, successRate: 0, avgLatencyMs: 0 },
      style: { requests: 0, successRate: 0, avgLatencyMs: 0 },
      research: { requests: 0, successRate: 0, avgLatencyMs: 0 },
    };

    for (const day of days) {
      const globalKey = `${MONITORING_KEY}:global:${day}`;
      const globalData = (await redis.hgetall(globalKey)) as Record<string, number> | null;
      if (globalData) {
        totalRequests += Number(globalData.requests) || 0;
        totalSuccesses += Number(globalData.successes) || 0;
        totalLatency += Number(globalData.totalLatency) || 0;
        totalTokens += Number(globalData.totalTokens) || 0;
      }

      for (const feature of features) {
        const featureKey = `${MONITORING_KEY}:feature:${day}:${feature}`;
        const fData = (await redis.hgetall(featureKey)) as Record<string, number> | null;
        if (fData) {
          byFeature[feature].requests += Number(fData.requests) || 0;
          byFeature[feature].avgLatencyMs += Number(fData.totalLatency) || 0;
        }
      }
    }

    // Calculate success rates and averages
    for (const feature of features) {
      if (byFeature[feature].requests > 0) {
        byFeature[feature].avgLatencyMs = Math.round(
          byFeature[feature].avgLatencyMs / byFeature[feature].requests
        );
      }
    }

    // Get recent requests
    const recentRaw = await redis.lrange(getRecentKey(), 0, 49);
    const recentRequests: AiRequestMetric[] = recentRaw
      .map((r) => {
        try {
          return JSON.parse(r as string) as AiRequestMetric;
        } catch {
          return null;
        }
      })
      .filter((r): r is AiRequestMetric => r !== null);

    return {
      totalRequests,
      successRate: totalRequests > 0 ? Math.round((totalSuccesses / totalRequests) * 100) : 100,
      avgLatencyMs: totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
      totalTokens,
      byFeature,
      recentRequests,
    };
  } catch {
    return {
      totalRequests: 0,
      successRate: 100,
      avgLatencyMs: 0,
      totalTokens: 0,
      byFeature: {
        suggest: { requests: 0, successRate: 0, avgLatencyMs: 0 },
        character: { requests: 0, successRate: 0, avgLatencyMs: 0 },
        plot: { requests: 0, successRate: 0, avgLatencyMs: 0 },
        style: { requests: 0, successRate: 0, avgLatencyMs: 0 },
        research: { requests: 0, successRate: 0, avgLatencyMs: 0 },
      },
      recentRequests: [],
    };
  }
}

export async function clearAiMetrics(): Promise<void> {
  try {
    const redis = getRedis();
    const days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    for (const day of days) {
      await redis.del(getMetricsKey(day));
      const features: AiFeature[] = ["suggest", "character", "plot", "style", "research"];
      for (const feature of features) {
        await redis.del(`${MONITORING_KEY}:feature:${day}:${feature}`);
      }
      await redis.del(`${MONITORING_KEY}:global:${day}`);
    }
    await redis.del(getRecentKey());
  } catch {
    // Non-critical
  }
}
