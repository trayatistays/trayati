"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseCachedFetchOptions = {
  endpoint: string;
  staleTime?: number;
  cacheTime?: number;
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string, staleTime: number): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > staleTime) return null;
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function useCachedFetch<T>({
  endpoint,
  staleTime = 5 * 60 * 1000,
  cacheTime = 30 * 60 * 1000,
}: UseCachedFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const cached = getFromCache<T>(endpoint, staleTime);
    if (cached) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      const response = await fetch(endpoint, {
        signal: abortRef.current.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      const result = (await response.json()) as T;
      setCache(endpoint, result);
      setData(result);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        return;
      }
      setError(caughtError instanceof Error ? caughtError.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, staleTime]);

  useEffect(() => {
    void fetchData();

    const interval = setInterval(() => {
      void fetchData();
    }, cacheTime);

    return () => {
      clearInterval(interval);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchData, cacheTime]);

  const refresh = useCallback(async () => {
    memoryCache.delete(endpoint);
    await fetchData();
  }, [endpoint, fetchData]);

  return { data, isLoading, error, refresh };
}
