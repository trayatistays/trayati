import { redis } from "@/lib/redis";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const MEMORY_TTL_MS = 60 * 1000;

function isMemoryCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  if (typeof window === "undefined") return false;
  return Date.now() - entry.timestamp < MEMORY_TTL_MS;
}

export async function multiLevelGet<T>(key: string): Promise<T | null> {
  if (typeof window !== "undefined") {
    const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (isMemoryCacheValid(memoryEntry) && memoryEntry) {
      return memoryEntry.data;
    }
  }

  try {
    const redisData = await redis.get<T>(key);
    if (redisData !== null) {
      if (typeof window !== "undefined") {
        memoryCache.set(key, { data: redisData, timestamp: Date.now() });
      }
      return redisData;
    }
  } catch (e) {
    console.error("Redis get error:", e);
  }

  return null;
}

export async function multiLevelSet<T>(
  key: string,
  data: T,
  redisTtlSeconds = 3600
): Promise<void> {
  if (typeof window !== "undefined") {
    memoryCache.set(key, { data, timestamp: Date.now() });
  }

  try {
    await redis.set(key, data, { ex: redisTtlSeconds });
  } catch (e) {
    console.error("Redis set error:", e);
  }
}

export async function multiLevelDel(pattern: string): Promise<void> {
  if (typeof window !== "undefined") {
    const keysToDelete: string[] = [];
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern) || key === pattern) {
        keysToDelete.push(key);
        memoryCache.delete(key);
      }
    }
  }

  try {
    const redisKeys = await redis.keys(`*${pattern}*`);
    if (redisKeys.length > 0) {
      await redis.del(...redisKeys);
    }
  } catch (e) {
    console.error("Redis del error:", e);
  }
}

export async function invalidateStaysCache(): Promise<void> {
  await multiLevelDel("stays:");
}

export async function invalidateTestimonialsCache(): Promise<void> {
  await multiLevelDel("testimonials:");
}

export async function invalidateExperiencesCache(): Promise<void> {
  await multiLevelDel("experiences:");
}

export async function invalidateDestinationsCache(): Promise<void> {
  await multiLevelDel("destinations:");
}

export function clearMemoryCache(): void {
  memoryCache.clear();
}

export function getMemoryCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}

if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (now - entry.timestamp > MEMORY_TTL_MS * 2) {
        memoryCache.delete(key);
      }
    }
  }, 60 * 1000);
}
