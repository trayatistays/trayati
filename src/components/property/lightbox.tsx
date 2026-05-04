"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import supabaseImageLoader from "@/lib/supabase-image-loader";

interface LightboxProps {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
  propertyTitle?: string;
}

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export default function Lightbox({ photos, initialIndex, onClose, propertyTitle }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, prevPhoto, nextPhoto]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextPhoto();
    } else if (isRightSwipe) {
      prevPhoto();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="fixed top-20 right-4 z-[10001] flex items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 transition-colors shadow-lg"
        aria-label="Close fullscreen view"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="fixed top-20 left-4 z-[10001]">
        <span className="text-sm font-medium tracking-wide text-white drop-shadow-md px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Navigation Arrows (Desktop) */}
      <button
        onClick={prevPhoto}
        className="absolute left-4 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Previous photo"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextPhoto}
        className="absolute right-4 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Next photo"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Image Container */}
      <div
        className="relative w-full h-full md:w-[90vw] md:h-[90vh] flex items-center justify-center select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
      >
        <Image
          src={photos[currentIndex]}
          alt={propertyTitle ? `${propertyTitle} — photo ${currentIndex + 1} of ${photos.length}` : `Photo ${currentIndex + 1} of ${photos.length}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          loader={supabaseImageLoader}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
        
        {/* Preload adjacent images — purely technical, hidden from screen readers */}
        <div className="hidden" aria-hidden="true">
          {photos[currentIndex - 1] && (
            <Image
              src={photos[currentIndex - 1]}
              alt=""
              aria-hidden="true"
              width={10}
              height={10}
              loader={supabaseImageLoader}
              priority
            />
          )}
          {photos[currentIndex + 1] && (
            <Image
              src={photos[currentIndex + 1]}
              alt=""
              aria-hidden="true"
              width={10}
              height={10}
              loader={supabaseImageLoader}
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
