"use client";

import { motion } from "framer-motion";
import { FeaturedStay } from "@/data/featured-stays";
import { ReserveNowButton } from "@/components/reserve-now-button";

interface PropertyBookingWidgetProps {
  stay: FeaturedStay;
}

export function PropertyBookingWidget({ stay }: PropertyBookingWidgetProps) {
  const minPrice = Math.min(...stay.roomTypes.map((r) => r.pricePerNight));
  const maxPrice = Math.max(...stay.roomTypes.map((r) => r.pricePerNight));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="sticky top-8 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-8">
        <div className="mb-2 text-sm text-white/80 font-semibold tracking-wide">
          From
        </div>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-bold text-white">₹{minPrice.toLocaleString()}</span>
          <span className="text-white/80 font-semibold">/night</span>
        </div>

        {minPrice !== maxPrice && (
          <div className="text-xs text-white/70 mb-6">
            up to ₹{maxPrice.toLocaleString()} for premium rooms
          </div>
        )}

        <div className="space-y-3">
          <motion.div
            className="flex items-center gap-2 text-white text-sm"
            whileHover={{ x: 5 }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            <span>{stay.roomTypes.length} room types</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-white text-sm"
            whileHover={{ x: 5 }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a1 1 0 111.414 1.414L5.414 6.828A1 1 0 015.05 4.05zm5 0a1 1 0 111.414 1.414L10.414 6.828a1 1 0 01-1.364-1.414L10.05 4.05zm5 0a1 1 0 111.414 1.414L15.414 6.828a1 1 0 01-1.364-1.414L15.05 4.05zm2.828 4.95a1 1 0 111.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414zm0 5a1 1 0 111.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414zM5.05 15.95a1 1 0 011.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414zM5.05 10.05a1 1 0 011.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414zm5 0a1 1 0 011.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414zm5 0a1 1 0 011.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414zm-4.95 5a1 1 0 011.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Check availability</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-white text-sm"
            whileHover={{ x: 5 }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.243 3.03a1 1 0 08-.486 1.944H5.25a.75.75 0 00-.75.75v9a.75.75 0 00.75.75h9.243a.75.75 0 001.581-.191.75.75 0 00-.731-.75H5.25v-9a.75.75 0 00-.75-.75h3.493a1 1 0 00.486-1.944H5.25A2.25 2.25 0 003 9v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-3.757z"
                clipRule="evenodd"
              />
            </svg>
            <span>Free cancellation</span>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>★ {stay.rating.toFixed(1)} rating</span>
          </div>
        </div>

        <ReserveNowButton
          stayId={stay.id}
          className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-all shadow-lg hover:shadow-xl"
        />

        <button className="w-full border-2 border-amber-600 text-amber-600 hover:bg-amber-50 font-semibold py-2 px-4 rounded-lg transition-colors">
          View Rooms
        </button>

        <p className="text-xs text-slate-500 text-center">
          No payment required until you confirm
        </p>
      </div>

      {/* Contact Info */}
      <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <p className="text-xs font-semibold text-slate-600 mb-3">
          Questions? Contact us
        </p>
        <div className="space-y-2">
          {stay.googleMapsUrl && (
            <a
              href={stay.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              📍 View on Map
            </a>
          )}
          <p className="text-sm text-slate-600">
            {stay.city}, {stay.state}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
