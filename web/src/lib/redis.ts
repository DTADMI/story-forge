import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Upstash Redis not configured — using in-memory fallback. Set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN.");
    }
    // Return a no-op compatible client for dev
    const noopRedis = {
      get: async () => null,
      set: async () => "OK",
      del: async () => 1,
      incr: async () => 1,
      expire: async () => 1,
      ttl: async () => -1,
      exists: async () => 0,
      hset: async () => 1,
      hget: async () => null,
      hgetall: async () => ({}),
      hdel: async () => 1,
      sadd: async () => 1,
      srem: async () => 1,
      smembers: async () => [],
      zadd: async () => 1,
      zrange: async () => [],
      pipeline: () => ({ exec: async () => [] }),
    } as unknown as Redis;

    return redisClient = noopRedis;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

export function clearRedis(): void {
  redisClient = null;
}
