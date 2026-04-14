"use client";

import Image from "next/image";
import supabaseImageLoader from "@/lib/supabase-image-loader";

interface PropertyPhotoCarouselProps {
  photos: string[];
  title: string;
}

export function PropertyPhotoCarousel({
  photos,
  title,
}: PropertyPhotoCarouselProps) {
  if (!photos || photos.length === 0) {
    return (
      <div
        className="flex min-h-80 w-full items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--background-soft)" }}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>No photos available</p>
      </div>
    );
  }

  const previewPhotos = photos.slice(0, 5);
  const remainingPhotos = photos.slice(5);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="grid auto-rows-[minmax(220px,1fr)] gap-3 sm:auto-rows-[minmax(260px,1fr)] sm:gap-4">
          <PhotoTile
            src={previewPhotos[0]}
            alt={`${title} photo 1`}
            priority
            className="min-h-[280px] sm:min-h-[420px]"
          />
        </div>

        {previewPhotos.length > 1 ? (
          <div className="grid gap-3 sm:grid-rows-2 sm:gap-4">
            {previewPhotos.slice(1, 3).map((photo, index) => (
              <PhotoTile
                key={`${photo}-${index + 1}`}
                src={photo}
                alt={`${title} photo ${index + 2}`}
                className="min-h-[180px] sm:min-h-0"
              />
            ))}
          </div>
        ) : null}
      </div>

      {previewPhotos.length > 3 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {previewPhotos.slice(3).map((photo, index) => (
            <PhotoTile
              key={`${photo}-${index + 4}`}
              src={photo}
              alt={`${title} photo ${index + 4}`}
              className="aspect-[4/3]"
            />
          ))}

          {Array.from({ length: Math.max(0, 5 - previewPhotos.length) }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="hidden rounded-lg lg:block"
              style={{ backgroundColor: "var(--background-soft)" }}
            />
          ))}
        </div>
      ) : null}

      {remainingPhotos.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {remainingPhotos.map((photo, index) => (
            <PhotoTile
              key={`${photo}-${index + 6}`}
              src={photo}
              alt={`${title} photo ${index + 6}`}
              className="aspect-[4/3]"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PhotoTile({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className ?? "aspect-[4/3]"}`}
      style={{ backgroundColor: "var(--background-soft)" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        loader={supabaseImageLoader}
      />
    </div>
  );
}
