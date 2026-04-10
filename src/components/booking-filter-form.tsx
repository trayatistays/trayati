"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { locations, guestCategories } from "@/data/social-links";

type FilterState = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  category: string;
};

export function BookingFilterForm({
  onFilter,
}: {
  onFilter: (filters: FilterState) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    category: "couple",
  });

  const handleChange = (key: keyof FilterState, value: string | number) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilter(updated);
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[2rem] border p-6 sm:p-8 backdrop-blur-xl"
      style={{
        borderColor: "rgba(80,150,220,0.3)",
        backgroundColor: "rgba(245,241,232,0.95)",
        boxShadow: "0 20px 60px rgba(32,60,76,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
    >
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 tracking-[-0.03em]">
        Discover Your Perfect Stay
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Location */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
          >
            <option value="">Select a destination...</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Check-in
          </label>
          <input
            type="date"
            min={minDate}
            value={filters.checkIn}
            onChange={(e) => handleChange("checkIn", e.target.value)}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Check-out
          </label>
          <input
            type="date"
            min={filters.checkIn || minDate}
            value={filters.checkOut}
            onChange={(e) => handleChange("checkOut", e.target.value)}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Number of Guests
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={filters.guests}
            onChange={(e) => handleChange("guests", parseInt(e.target.value))}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: "var(--muted)" }}>
            Guest Type
          </label>
          <div className="flex flex-wrap gap-2">
            {guestCategories.map((cat) => (
              <motion.button
                key={cat.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChange("category", cat.value)}
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition border"
                style={{
                  borderColor: filters.category === cat.value ? "var(--cta)" : "var(--border-soft)",
                  backgroundColor: filters.category === cat.value ? "rgba(199,91,26,0.1)" : "rgba(255,255,255,0.6)",
                  color: filters.category === cat.value ? "var(--cta)" : "var(--foreground)",
                }}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Info text */}
      <p className="mt-6 text-xs" style={{ color: "var(--muted)" }}>
        💡 Tip: Select your preferences to see personalized property matches
      </p>
    </motion.div>
  );
}
