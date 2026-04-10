"use client";

import { AmenitiesDetail } from "@/data/featured-stays";
import { motion } from "framer-motion";

interface PropertyAmenitiesProps {
  amenitiesDetail: AmenitiesDetail;
  amenitiesList: string[];
}

export function PropertyAmenities({
  amenitiesDetail,
  amenitiesList,
}: PropertyAmenitiesProps) {
  const amenityIcons: Record<keyof AmenitiesDetail, React.ReactNode> = {
    parking: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V11h-8V3zm0 11h-2v-2h2v2zm4-2h-2v2h2v-2zm-4-6h2v2h-2V6z" />
      </svg>
    ),
    heaterOnRequest: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 2.35 13.5.67zm-3.5 16c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2z" />
      </svg>
    ),
    tv: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8v2H9v2h6v-2h-2v-2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" />
      </svg>
    ),
    fridge: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16z" />
      </svg>
    ),
    washingMachine: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="13" r="4" />
        <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14z" />
      </svg>
    ),
    powerBackup: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9c0 .92.74 1.66 1.66 1.66.92 0 1.66-.74 1.66-1.66v-1h4v1c0 .92.74 1.66 1.66 1.66.92 0 1.66-.74 1.66-1.66V5.33C17 4.6 16.4 4 15.67 4zm-.01 5h-7.32V5.33h7.32V9z" />
      </svg>
    ),
    airConditioning: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 2H8c-1.1 0-2 .9-2 2v4h2V4h8v4h2V4c0-1.1-.9-2-2-2zm6 7h-2v2h-2v2h2v2h2v-2h2v-2h-2V9zM4 9h2v2H4v-2zm16 8h-2v2H4v-2H2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4zm-16-4h2v2H4v-2z" />
      </svg>
    ),
    geyser: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    ),
    kitchen: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 4h-5V2h-2v2H7c-1.1 0-1.99.9-1.99 2L5 18c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 16h-4v-5h4v5zm8 0h-4v-5h4v5zm0-7H7v-5h13v5z" />
      </svg>
    ),
    garden: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    balcony: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 11h-4.18C17.6 7.43 14.52 4.9 11 4.9s-6.6 2.53-6.82 6.1H2v2h4.18C4.4 16.57 7.48 19.1 11 19.1s6.6-2.53 6.82-6.1H22v-2zm-11 6c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
      </svg>
    ),
    lounge: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
    ),
    studyArea: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18l-2 2-2-2H6V4h12v16h-7z" />
      </svg>
    ),
    fireplace: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 2.35 13.5.67zm-3.5 16c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2z" />
      </svg>
    ),
    pool: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.5 10h1L8 8.5h-1.5L6.5 10zm3 0h1L11 8.5h-1.5L9.5 10zm3 0h1L14 8.5h-1.5L12.5 10zM7 5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H7zm0 12V7h10v10H7z" />
      </svg>
    ),
    spa: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  };

  const activeAmenities = Object.entries(amenitiesDetail).filter(
    ([, value]) => value === true
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Highlight Amenities */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Highlights
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {amenitiesList.map((amenity) => (
            <motion.div
              key={amenity}
              className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 px-3 py-2 text-sm font-medium text-amber-900 text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {amenity}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Amenities */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          Available Amenities
        </h3>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeAmenities.map(([key]) => (
            <motion.div
              key={key}
              variants={itemVariants}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              <div className="text-emerald-600">
                {amenityIcons[key as keyof AmenitiesDetail]}
              </div>
              <span className="text-xs font-semibold text-center capitalize">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .toLowerCase()}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
