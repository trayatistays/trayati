"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyPhotoCarouselProps {
  photos: string[];
  title: string;
}

export function PropertyPhotoCarousel({
  photos,
  title,
}: PropertyPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 relative group">
      {/* Main Image Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <Image
            src={photos[currentIndex]}
            alt={`${title} - Photo ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
        aria-label="Previous photo"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
        aria-label="Next photo"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Photo Counter & Thumbnail Navigation */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/60 to-black/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">
            {currentIndex + 1} / {photos.length}
          </span>
          <div className="flex gap-2">
            {photos.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-white px-3 py-1.5"
                    : "bg-white/40 hover:bg-white/60 px-2 py-1"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`text-xs font-bold ${
                    idx === currentIndex ? "text-slate-900" : "text-white"
                  }`}
                >
                  {idx + 1}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
