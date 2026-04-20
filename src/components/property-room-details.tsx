"use client";

import { RoomType } from "@/data/featured-stays";
import { motion } from "framer-motion";

interface PropertyRoomDetailsProps {
  roomTypes: RoomType[];
}

export function PropertyRoomDetails({ roomTypes }: PropertyRoomDetailsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Room Types
        </h3>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {roomTypes.map((room) => (
          <motion.div
            key={room.id}
            variants={itemVariants}
            className="rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-lg p-5 bg-gradient-to-br from-white to-slate-50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg text-slate-900">
                  {room.name}
                </h4>
                <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
                  {room.category}
                </span>
              </div>
              <span className="text-2xl font-bold text-amber-600">
                ₹{room.pricePerNight.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {room.units}
                </span>
                <span>unit{room.units > 1 ? "s" : ""} available</span>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span>{room.bedConfiguration}</span>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.604 5h10.192A1 1 0 0016 6v2a1 1 0 01-1 1h-1.798l-.556 8.321A2 2 0 0110.65 19H9.35a2 2 0 01-1.996-1.679L6.798 9H5a1 1 0 01-1-1V6a1 1 0 01.604-.945M7 11a1 1 0 100 2h6a1 1 0 100-2H7z" />
                </svg>
                <span>{room.bathroom}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100 6 3 3 0 000-6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <span>Max {room.maxOccupancy} guest{room.maxOccupancy > 1 ? "s" : ""}</span>
              </div>

              {room.extraBedOption && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-medium text-emerald-700">
                    ✓ {room.extraBedOption}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
