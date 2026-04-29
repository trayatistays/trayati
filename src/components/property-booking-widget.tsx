"use client";

import { motion } from "framer-motion";
import { FeaturedStay } from "@/data/featured-stays";
import { ReserveNowButton } from "@/components/reserve-now-button";

interface PropertyBookingWidgetProps {
  stay: FeaturedStay;
}

export function PropertyBookingWidget({ stay }: PropertyBookingWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="sticky top-8 overflow-hidden rounded-2xl border"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: "rgba(245,241,233,0.98)",
        boxShadow: "0 10px 40px rgba(74,101,68,0.08)",
      }}
    >
      <div
        className="px-6 py-8"
        style={{
          background: "linear-gradient(135deg, var(--secondary), var(--primary))",
        }}
      >
        <div className="mb-2 text-sm font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.8)" }}>
          Book Your Stay
        </div>
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">Contact Us</span>
        </div>

        <div className="space-y-3">
          <motion.div
            className="flex items-center gap-2 text-sm text-white"
            whileHover={{ x: 5 }}
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            <span>{stay.roomTypes.length} room types</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-sm text-white"
            whileHover={{ x: 5 }}
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Check availability</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-sm text-white"
            whileHover={{ x: 5 }}
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Free cancellation</span>
          </motion.div>
        </div>
      </div>

      <div className="space-y-3 px-6 py-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground-soft)" }}>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span style={{ color: "var(--primary)" }}>★ {stay.rating.toFixed(1)} rating</span>
          </div>
        </div>

        <ReserveNowButton
          stayId={stay.id}
          stayTitle={stay.title}
          bookingLink={stay.bookingLink}
          className="block w-full rounded-lg bg-[var(--button-primary)] px-4 py-3 text-center font-bold text-white transition-all hover:bg-[var(--button-primary-hover)] hover:shadow-xl"
        />

        <ReserveNowButton
          text="View Rooms"
          stayId={stay.id}
          stayTitle={stay.title}
          bookingLink={stay.bookingLink}
          className="w-full rounded-lg border-2 py-2 px-4 font-semibold transition-colors"
          style={{
            borderColor: "var(--cta)",
            color: "var(--cta)",
          }}
        />

        <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
          No payment required until you confirm
        </p>
      </div>

      <div
        className="border-t px-6 py-4"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "var(--background-soft)",
        }}
      >
        <p className="mb-3 text-xs font-semibold" style={{ color: "var(--foreground-soft)" }}>
          Questions? Contact us
        </p>
        <div className="space-y-2">
          {stay.googleMapsUrl && (
            <a
              href={stay.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium"
              style={{ color: "var(--cta)" }}
            >
              📍 View on Map
            </a>
          )}
          <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>
            {stay.city}, {stay.state}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
