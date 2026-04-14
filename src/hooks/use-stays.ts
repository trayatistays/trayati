"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeaturedStay } from "@/data/featured-stays";

const STAYS_CACHE_KEY = "trayati-stays-cache-v2";
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

      const response = await fetch("/api/stays", {
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
