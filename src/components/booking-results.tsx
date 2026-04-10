"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { featuredStays } from "@/data/featured-stays";

type FilterState = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  category: string;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function BookingResults({ filters }: { filters: FilterState }) {
  const filteredStays = useMemo(() => {
    return featuredStays.filter((stay) => {
      if (filters.location && !stay.state.includes(filters.location)) {
        return false;
      }
      return true;
    });
  }, [filters.location]);

  if (filteredStays.length === 0) {
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
          transition={{ delay: idx * 0.1, duration: 0.4 }}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
          className="group rounded-[1.5rem] border overflow-hidden backdrop-blur-xl cursor-pointer"
          style={{
            borderColor: "rgba(80,150,220,0.2)",
            backgroundColor: "rgba(245,241,232,0.9)",
            boxShadow: "0 10px 40px rgba(32,60,76,0.08)",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(32,60,76,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 10px 40px rgba(32,60,76,0.08)";
          }}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={stay.image}
              alt={stay.alt}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute top-3 right-3">
              <span
                className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(199,91,26,0.8)",
                }}
              >
                {stay.tag}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold tracking-[-0.03em] leading-tight mb-1">
              {stay.title}
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              {stay.city}, {stay.state}
            </p>

            {/* Rating & Price */}
            <div className="flex items-center gap-3 mb-4 text-sm font-semibold">
              <span
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(30,109,191,0.15)", color: "var(--primary)" }}
              >
                ★ {stay.rating.toFixed(1)}
              </span>
              <span
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(199,91,26,0.15)", color: "var(--cta)" }}
              >
                {formatPrice(stay.pricePerNight)}/night
              </span>
            </div>

            {/* Description */}
            <p className="text-xs leading-5 mb-4 line-clamp-2" style={{ color: "var(--foreground-soft)" }}>
              {stay.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Link
                href={`/property/${stay.id}`}
                className="flex-1 rounded-full py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "rgba(32,60,76,0.75)",
                  border: "1px solid rgba(245,241,232,0.3)",
                  boxShadow: "0 8px 24px rgba(32,60,76,0.2)",
                }}
              >
                Details
              </Link>
              <Link
                href={`/booking?stayId=${stay.id}`}
                className="flex-1 rounded-full py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "var(--cta)",
                  boxShadow: "0 8px 24px rgba(199,91,26,0.3)",
                }}
              >
                Book Now
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
