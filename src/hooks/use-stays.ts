"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeaturedStay } from "@/data/featured-stays";

const STAYS_CACHE_KEY = "trayati-stays-cache-v3";
const STALE_TIME = 5 * 60 * 1000;

type StaysCache = {
  data: FeaturedStay[];
  timestamp: number;
};

function getStaysFromStorage(): FeaturedStay[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STAYS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaysCache;
    if (Date.now() - parsed.timestamp > STALE_TIME) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function setStaysToStorage(stays: FeaturedStay[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      STAYS_CACHE_KEY,
      JSON.stringify({ data: stays, timestamp: Date.now() } satisfies StaysCache),
    );
  } catch {}
}

export function useStays() {
  const [stays, setStays] = useState<FeaturedStay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    const cached = getStaysFromStorage();
    if (cached && cached.length > 0) {
      setStays(cached);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const response = await fetch("/api/stays?fields=minimal", {
        signal: abortRef.current.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Unable to load stays.");
      }

      const data = (await response.json()) as { stays: FeaturedStay[] };
      setStays(data.stays);
      setStaysToStorage(data.stays);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load stays.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [refresh]);

  return {
    stays,
    isLoading,
    error,
    refresh,
  };
}

export type PaginatedStaysOptions = {
  limit?: number;
  featured?: boolean;
  experienceType?: string;
  city?: string;
  state?: string;
};

export type PaginatedStaysResult = {
  stays: FeaturedStay[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function usePaginatedStays(options: PaginatedStaysOptions = {}): PaginatedStaysResult {
  const { limit = 6, featured, experienceType, city, state } = options;
  
  const [stays, setStays] = useState<FeaturedStay[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef(false);

  const buildUrl = useCallback((cursorParam: string | null) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (cursorParam) params.set("cursor", cursorParam);
    if (featured !== undefined) params.set("featured", String(featured));
    if (experienceType) params.set("experienceType", experienceType);
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    params.set("fields", "minimal");
    return `/api/stays?${params.toString()}`;
  }, [limit, featured, experienceType, city, state]);

  const fetchData = useCallback(async (cursorParam: string | null, append: boolean) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const response = await fetch(buildUrl(cursorParam), {
        signal: abortRef.current.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Unable to load stays.");
      }

      const data = (await response.json()) as {
        stays: FeaturedStay[];
        nextCursor: string | null;
        hasMore: boolean;
      };

      if (append) {
        setStays((prev) => [...prev, ...data.stays]);
      } else {
        setStays(data.stays);
      }
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load stays.",
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildUrl]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchData(cursor, true);
  }, [hasMore, isLoadingMore, cursor, fetchData]);

  const refresh = useCallback(async () => {
    setCursor(null);
    setHasMore(true);
    await fetchData(null, false);
  }, [fetchData]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchData(null, false);
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  return {
    stays,
    nextCursor: cursor,
    hasMore,
    isLoading: isLoading && stays.length === 0,
    error,
    loadMore,
    refresh,
  };
}
