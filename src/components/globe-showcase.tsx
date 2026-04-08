"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const propertyPhotos = [
  {
    src: "/property-view.jpg",
    title: "Mountain Panorama",
    subtitle: "Wide valley views",
    position: "left-0 top-10",
    rotation: -10,
  },
  {
    src: "/property-exterior.jpg",
    title: "Exterior Arrival",
    subtitle: "Warm lighting facade",
    position: "right-4 top-2",
    rotation: 9,
  },
  {
    src: "/property-lounge.jpg",
    title: "Lounge Living",
    subtitle: "Wood, light, and comfort",
    position: "left-8 bottom-8",
    rotation: -6,
  },
  {
    src: "/property-balcony.jpg",
    title: "Balcony Seating",
    subtitle: "Sunrise coffee corner",
    position: "right-0 bottom-16",
    rotation: 8,
  },
];

export function GlobeShowcase() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] border border-black/8 bg-white/55 p-6 shadow-[0_30px_90px_rgba(135,144,170,0.18)] backdrop-blur-2xl lg:min-h-[690px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_25%),radial-gradient(circle_at_80%_20%,rgba(92,200,201,0.14),transparent_18%)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#7b8291]">Explore the map</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[#171b24] sm:text-4xl">
              Stay discovery around the world
            </h2>
          </div>
          <div className="rounded-full border border-black/8 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#6d7485]">
            Hover the globe
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 36, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b6bed1]/65 sm:h-[32rem] sm:w-[32rem] lg:h-[38rem] lg:w-[38rem]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 30, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#c5cddd]/75 sm:h-[36rem] sm:w-[36rem] lg:h-[44rem] lg:w-[44rem]"
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/55 sm:h-[40rem] sm:w-[40rem] lg:h-[48rem] lg:w-[48rem]" />

          <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative flex size-[22rem] items-center justify-center rounded-full sm:size-[28rem] lg:size-[34rem]"
          >
            <div className="globe-sphere relative size-full overflow-hidden rounded-full border border-white/80 bg-[#dce6fb] shadow-[inset_-40px_-50px_80px_rgba(99,118,173,0.18),inset_30px_40px_60px_rgba(255,255,255,0.75),0_35px_80px_rgba(108,124,164,0.2)]">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-center"
                aria-label="Rotating globe video"
              >
                <source src="/globe.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.58),transparent_24%),radial-gradient(circle_at_70%_72%,rgba(167,139,250,0.08),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(8,15,40,0.12))]" />
            </div>

            <AnimatePresence>
              {isHovered &&
                propertyPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.src}
                    initial={{ opacity: 0, scale: 0.8, y: 24 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotate: photo.rotation,
                    }}
                    exit={{ opacity: 0, scale: 0.82, y: 18 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className={`absolute ${photo.position} w-40 rounded-[1.5rem] border border-white/85 bg-white/88 p-2 shadow-[0_20px_45px_rgba(64,71,96,0.18)] backdrop-blur-xl sm:w-44`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem]">
                      <Image
                        src={photo.src}
                        alt={photo.title}
                        fill
                        sizes="176px"
                        className="object-cover"
                      />
                    </div>
                    <div className="px-1 pb-1 pt-3">
                      <p className="font-display text-sm font-semibold text-[#1b2130]">{photo.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#71798a]">
                        {photo.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#242936]">Trayati Stays</p>
            <p className="mt-1 text-sm text-[#70788a]">
              Explore destinations with a cinematic, property-first journey.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[#5f6879]">
            Hover to reveal curated property photography
          </div>
        </div>
      </div>
    </div>
  );
}
