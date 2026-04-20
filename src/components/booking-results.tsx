"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePaginatedStays } from "@/hooks/use-stays";

type FilterState = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  category: string;
  experienceType: string;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function BookingResults({ filters }: { filters: FilterState }) {
  const { stays, isLoading, hasMore, loadMore, error } = usePaginatedStays({
    limit: 6,
    experienceType: filters.experienceType || undefined,
    city: filters.location || undefined,
  });
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      if (
        filters.location &&
        !`${stay.city} ${stay.state} ${stay.country}`
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.experienceType &&
        stay.experienceType !== filters.experienceType
      ) {
        return false;
      }
      return true;
    });
  }, [filters.experienceType, filters.location, stays]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  if (isLoading && stays.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-[1.5rem] border overflow-hidden animate-pulse"
            style={{
              borderColor: "rgba(74,101,68,0.2)",
              backgroundColor: "rgba(245,241,233,0.5)",
            }}
          >
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-5 sm:p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (filteredStays.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <p className="font-display text-2xl font-bold mb-2">No properties found</p>
        <p style={{ color: "var(--muted)" }}>Try adjusting your filters</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredStays.map((stay, idx) => (
          <motion.div
            key={stay.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.3), duration: 0.4 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group rounded-[1.5rem] border overflow-hidden backdrop-blur-xl"
            style={{
              borderColor: "rgba(74,101,68,0.2)",
              backgroundColor: "rgba(245,241,233,0.9)",
              boxShadow: "0 10px 40px rgba(74,101,68,0.08)",
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={stay.image}
                alt={stay.alt}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute top-3 right-3">
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md"
                  style={{
                    backgroundColor: "rgba(164,108,43,0.8)",
                  }}
                >
                  {stay.tag}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <h3 className="font-display text-lg font-bold tracking-[-0.03em] leading-tight mb-1">
                {stay.title}
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                {stay.city}, {stay.state}
              </p>

              <p
                className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--gold)" }}
              >
                {stay.experienceType}
              </p>

              <div className="flex items-center gap-3 mb-4 text-sm font-semibold">
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(74,101,68,0.15)", color: "var(--primary)" }}
                >
                  ★ {stay.rating.toFixed(1)}
                </span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(164,108,43,0.15)", color: "var(--cta)" }}
                >
                  {formatPrice(stay.pricePerNight)}/night
                </span>
              </div>

              <p className="text-xs leading-5 mb-4 line-clamp-2" style={{ color: "var(--foreground-soft)" }}>
                {stay.description}
              </p>

              <div className="flex gap-3">
                <Link
                  href={`/property/${stay.id}`}
                  className="flex-1 rounded-full py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: "rgba(74,101,68,0.75)",
                    border: "1px solid rgba(245,241,232,0.3)",
                    boxShadow: "0 8px 24px rgba(74,101,68,0.2)",
                  }}
                >
                  Details
                </Link>
                <Link
                  href={`/booking?stayId=${stay.id}`}
                  className="flex-1 rounded-full bg-[var(--button-primary)] py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 hover:bg-[var(--button-primary-hover)] active:scale-95"
                  style={{
                    boxShadow: "0 8px 24px rgba(74,101,68,0.3)",
                  }}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {hasMore && (
          <button
            onClick={() => loadMore()}
            disabled={isLoading}
            className="rounded-full px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] transition hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: "rgba(74,101,68,0.1)",
              color: "var(--primary)",
              border: "1px solid rgba(74,101,68,0.2)",
            }}
          >
            {isLoading ? "Loading..." : "Load More Properties"}
          </button>
        )}
      </div>
    </>
  );
}
