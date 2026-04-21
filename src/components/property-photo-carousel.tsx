"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import supabaseImageLoader from "@/lib/supabase-image-loader";

// Dynamically import the Lightbox so it's not included in the main bundle
const Lightbox = dynamic(() => import("./property/lightbox"), { ssr: false });

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

interface PropertyPhotoCarouselProps {
  photos: string[];
  title: string;
}

export function PropertyPhotoCarousel({ photos, title }: PropertyPhotoCarouselProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  if (!photos || photos.length === 0) {
    return (
      <div
        className="flex min-h-80 w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: "var(--background-soft)" }}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>No photos available</p>
      </div>
    );
  }

  // We show up to 4 preview photos, and the 5th item will be the CTA card
  const MAX_VISIBLE = 4;
  const previewPhotos = photos.slice(0, MAX_VISIBLE);
  const hasMore = photos.length > MAX_VISIBLE;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.4; // rough width of one card on desktop
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const galleryUrl = `${pathname}/gallery`;

  return (
    <>
      <div className="relative group/carousel">
        {/* Navigation Arrows (Desktop Only) */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-black shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white hover:scale-105"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-black shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white hover:scale-105"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Horizontal Scroller (Used for both Desktop & Mobile based on user requirement) */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scroll-bar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {previewPhotos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="relative min-w-[85vw] sm:min-w-[70vw] md:min-w-[50vw] lg:min-w-[40vw] aspect-[4/3] sm:aspect-video snap-start rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
              style={{ backgroundColor: "var(--background-soft)" }}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={photo}
                alt={`${title} photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                loader={supabaseImageLoader}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            </div>
          ))}

          {/* Final CTA Card */}
          {hasMore && (
            <Link
              href={galleryUrl}
              className="relative min-w-[85vw] sm:min-w-[70vw] md:min-w-[50vw] lg:min-w-[40vw] aspect-[4/3] sm:aspect-video snap-start rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 group/cta border border-[var(--border-soft)] transition-all hover:shadow-lg"
              style={{ backgroundColor: "var(--background-soft)" }}
              prefetch={true}
            >
              {/* Blurred background image of the 5th photo */}
              <div className="absolute inset-0 opacity-40 group-hover/cta:scale-105 transition-transform duration-500">
                <Image
                  src={photos[MAX_VISIBLE]}
                  alt={`${title} more photos`}
                  fill
                  className="object-cover blur-[2px]"
                  loading="lazy"
                  loader={supabaseImageLoader}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              </div>
              <div className="absolute inset-0 bg-black/20" />
              
              <div className="relative z-10 flex flex-col items-center gap-3 text-white">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <span className="font-semibold text-lg drop-shadow-md">Show all {photos.length} photos</span>
              </div>
            </Link>
          )}
        </div>

        {/* Global CSS for hide-scroll-bar to remove the scrollbar but keep functionality */}
        <style dangerouslySetInnerHTML={{ __html: `
          .hide-scroll-bar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scroll-bar::-webkit-scrollbar {
            display: none;
          }
        `}} />
      </div>

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
