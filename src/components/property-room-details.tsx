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
        <h3
          className="mb-6 flex items-center gap-2 font-display text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "var(--cta)" }}
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Room Types
        </h3>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {roomTypes.map((room) => (
          <motion.div
            key={room.id}
            variants={itemVariants}
            className="rounded-xl border p-5 transition-all duration-300"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(245,241,233,0.9)",
            }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                  {room.name}
                </h4>
                <span
                  className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    color: "var(--cta)",
                    backgroundColor: "rgba(164,108,43,0.12)",
                  }}
                >
                  {room.category}
                </span>
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--cta)" }}>Contact for pricing</span>
            </div>

            <div className="space-y-3 text-sm" style={{ color: "var(--foreground-soft)" }}>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {room.units}
                </span>
                <span>unit{room.units > 1 ? "s" : ""} available</span>
              </div>

              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span>{room.bedConfiguration}</span>
              </div>

              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.604 5h10.192A1 1 0 0016 6v2a1 1 0 01-1 1h-1.798l-.556 8.321A2 2 0 0110.65 19H9.35a2 2 0 01-1.996-1.679L6.798 9H5a1 1 0 01-1-1V6a1 1 0 01.604-.945M7 11a1 1 0 100 2h6a1 1 0 100-2H7z" />
                </svg>
                <span>{room.bathroom}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100 6 3 3 0 000-6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <span>Max {room.maxOccupancy} guest{room.maxOccupancy > 1 ? "s" : ""}</span>
              </div>

              {room.extraBedOption && (
                <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--border-soft)" }}>
                  <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                    &#10003; {room.extraBedOption}
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

