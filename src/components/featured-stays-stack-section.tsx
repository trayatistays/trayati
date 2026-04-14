"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FeaturedStay } from "@/data/featured-stays";
import { useStays } from "@/hooks/use-stays";
import supabaseImageLoader from "@/lib/supabase-image-loader";

const AUTO_INTERVAL = 4000;
const VISIBLE_STACK = 3;
const CARD_OFFSET = 18;
const CARD_SCALE_STEP = 0.05;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function StayCard({
  stay,
  index,
  total,
}: {
  stay: FeaturedStay;
  index: number;
  total: number;
}) {
  const offset = index * CARD_OFFSET;
  const scale = 1 - index * CARD_SCALE_STEP;
  const opacity = 1;

  return (
    <motion.div
      layout
      className="absolute inset-0"
      style={{
        y: offset,
        scale,
        opacity,
        zIndex: total - index,
        transformOrigin: "top center",
      }}
      initial={{ y: offset - 60, opacity: 0, scale: scale - 0.05 }}
      animate={{ y: offset, opacity, scale }}
      exit={{ y: offset + 120, opacity: 0, scale: scale - 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{
          boxShadow:
            index === 0
              ? "0 24px 60px rgba(74,101,68,0.25)"
              : "0 12px 30px rgba(74,101,68,0.12)",
        }}
      >
        <Image
          src={stay.image}
          alt={stay.alt}
          fill
          className="object-cover"
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 60vw"
          loader={supabaseImageLoader}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(74,101,68,0.40)] via-transparent to-transparent" />

        <div className="absolute top-4 left-5 sm:top-5 sm:left-6">
          <span className="font-display text-[0.6rem] font-bold uppercase tracking-[0.44em] text-white/50">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="absolute top-4 right-5 sm:top-5 sm:right-6">
          <span
            className="rounded-full px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-white"
            style={{
              backgroundColor: "rgba(74,101,68,0.75)",
              border: "1px solid rgba(245,241,233,0.22)",
            }}
          >
            {stay.tag}
          </span>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 lg:p-10">
          <p className="text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-white/55 mb-2">
            {stay.type}&nbsp;·&nbsp;{stay.city}, {stay.state}
          </p>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-[2.8rem] font-bold text-white tracking-[-0.03em] leading-[1.05]">
            {stay.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/45 font-semibold mt-1 tracking-[0.1em]">
            {stay.subtitle}
          </p>
          <p className="mt-3 text-white/75 text-xs sm:text-sm leading-6 max-w-[48ch]">
            {stay.description}
          </p>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className="rounded-full px-4 py-2 text-xs sm:text-sm font-bold text-white"
              style={{ backgroundColor: "rgba(164, 108, 43, 0.88)" }}
            >
              {formatPrice(stay.pricePerNight)}&nbsp;/&nbsp;night
            </span>
            <span
              className="rounded-full px-3 py-2 text-xs sm:text-sm font-semibold text-white"
              style={{ boxShadow: "0 0 20px rgba(164,108,43,0.6)" }}
            >
              ★&nbsp;{stay.rating.toFixed(1)}
            </span>
            <Link
              href={`/booking?stayId=${stay.id}`}
              className="inline-flex rounded-full bg-[var(--button-primary)] px-5 py-2 text-xs font-bold text-white shadow-[0_14px_36px_rgba(74,101,68,0.45)] transition hover:scale-105 hover:bg-[var(--button-primary-hover)] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              Book This Stay
            </Link>
            <Link
              href={`/property/${stay.id}`}
              className="inline-flex rounded-full px-5 py-2 text-xs sm:text-sm font-bold text-white transition hover:opacity-90 sm:px-6 sm:py-2.5"
              style={{
                backgroundColor: "rgba(255, 255, 255, 1)",
                border: "1.5px solid rgba(255,255,255,0.65)",
              }}
            >
              View Details&nbsp;→
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedStaysStackSection() {
  const { stays, isLoading, error } = useStays();
  const activeStays = stays.filter((stay) => stay.isFeatured === true);
  const total = activeStays.length;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    if (total <= 1) return;
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(advance, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, paused, total]);

  const getVisibleStays = () => {
    if (total === 0) return [];
    const visible = [];
    for (let i = 0; i < Math.min(VISIBLE_STACK, total); i++) {
      visible.push(activeStays[(current + i) % total]);
    }
    return visible;
  };

  const visibleStays = getVisibleStays();

  if (isLoading && total === 0) {
    return (
      <section className="px-6 pb-10 pt-6 sm:px-10 lg:px-16">
        <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>
          Loading featured stays...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 pb-10 pt-6 sm:px-10 lg:px-16">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="px-6 pb-10 pt-6 sm:px-10 lg:px-16">
        <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>
          No featured stays selected yet.
        </p>
      </section>
    );
  }

  return (
    <section
      id="featured-stays"
      className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
    >
      <div
        className="absolute inset-x-0 top-0 h-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(164,108,43,0.10), transparent 48%), radial-gradient(circle at top right, rgba(74,101,68,0.12), transparent 40%)",
        }}
      />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(260px,0.65fr)_minmax(0,1.35fr)] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 lg:sticky lg:top-28 lg:h-fit"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.44em]"
            style={{ color: "var(--cta)" }}
          >
            Featured Stays
          </p>
          <div className="space-y-4">
            <h2
              className="font-display text-3xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-4xl lg:text-[3.2rem]"
              style={{ color: "var(--primary)" }}
            >
              Handpicked stays, curated for you.
            </h2>
            <p
              className="max-w-[34ch] text-sm leading-7 sm:text-base"
              style={{ color: "var(--foreground-soft)" }}
            >
              Each property is handpicked for its character, setting, and the
              quality of experience it delivers.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {activeStays.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className="transition-all duration-300"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i === current ? "var(--primary)" : "rgba(74,101,68,0.2)",
                  cursor: "pointer",
                }}
                aria-label={`Go to stay ${i + 1}`}
              />
            ))}
          </div>

          <p
            className="text-[0.65rem] font-semibold uppercase tracking-[0.3em]"
            style={{ color: "rgba(74,101,68,0.50)" }}
          >
            Auto-scrolling · Hover to pause
          </p>
        </motion.div>

        <div
          className="relative w-full"
          style={{ aspectRatio: "4 / 5", minHeight: "480px" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="popLayout">
            {visibleStays.map((stay, i) => (
              <StayCard
                key={`${stay.id}-${current}`}
                stay={stay}
                index={i}
                total={visibleStays.length}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
