"use client";

import { useCallback, useEffect, useState } from "react";
import { featuredStays, type FeaturedStay } from "@/data/featured-stays";

export function useStays() {
  const [stays, setStays] = useState<FeaturedStay[]>(featuredStays);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/stays", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to load stays.");
      }

      const data = (await response.json()) as { stays: FeaturedStay[] };
      setStays(data.stays);
    } catch (caughtError) {
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
  }, [refresh]);

  return {
    stays,
    setStays,
    isLoading,
    error,
    refresh,
  };
}
