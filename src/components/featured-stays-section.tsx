"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { featuredStays, type FeaturedStay } from "@/data/featured-stays";
import { useStays } from "@/hooks/use-stays";

// ─── Constants ────────────────────────────────────────────────────
// Reduced from 125vh → 110vh per card for snappier transitions
const VH_PER_CARD = 110;

// Spring config for buttery smoothness
const SPRING_CONFIG = { stiffness: 120, damping: 30, mass: 0.5 };

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Progress Dot ─────────────────────────────────────────────────
function ProgressDot({
  index,
  scrollProgress,
  total,
}: {
  index: number;
  scrollProgress: MotionValue<number>;
  total: number;
}) {
  const s = index / total;
  const e = (index + 1) / total;
  const buf = 0.04;
  const opacity = useTransform(
    scrollProgress,
    [Math.max(0, s - buf), s, Math.min(1, e - buf), Math.min(1, e)],
    [0.28, 1, 1, 0.28]
  );
  const scale = useTransform(
    scrollProgress,
    [Math.max(0, s - buf), s, Math.min(1, e - buf), Math.min(1, e)],
    [0.7, 1.5, 1.5, 0.7]
  );
  return (
    <motion.div
      style={{
        opacity,
        scale,
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: "var(--primary)",
      }}
    />
  );
}

// ─── Stay Card ────────────────────────────────────────────────────
// GPU-optimised: all animations use translate3d/scale (compositor-only).
// No string percentages — numeric pixel values via viewport height.
function StayCard({
  stay,
  index,
  scrollProgress,
  total,
}: {
  stay: FeaturedStay;
  index: number;
  scrollProgress: MotionValue<number>;
  total: number;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const segStart = index / total;
  const segEnd = (index + 1) / total;

  // ── Scale down (numeric only — GPU composited) ────────────────
  const rawScale = useTransform(
    scrollProgress,
    isLast ? [0, 1] : [segStart, segEnd],
    isLast ? [1, 1] : [1, 0.92]
  );
  const scale = useSpring(rawScale, SPRING_CONFIG);

  // ── Slide in from below (numeric vh → px at render) ───────────
  const prevSegStart = (index - 1) / total;
  const prevSegEnd = index / total;
  const rawY = useTransform(
    scrollProgress,
    isFirst ? [0, 1] : [prevSegStart, prevSegEnd],
    isFirst ? [0, 0] : [100, 0] // percentage values
  );
  const springY = useSpring(rawY, SPRING_CONFIG);
  // Convert numeric % to CSS vh string for proper viewport-relative movement
  const y = useTransform(springY, (v) => `${v}vh`);

  const zIndex = index + 1;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        scale,
        y: isFirst ? undefined : y,
        zIndex,
        willChange: "transform",
      }}
    >
      {/* Gutter around card */}
      <div className="relative w-full h-full p-3 sm:p-4 lg:p-5">
        <div
          className="relative w-full h-full overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
          style={{
            /* Single simpler shadow instead of 3-layer — much cheaper to paint */
            boxShadow: "0 24px 60px rgba(32,60,76,0.22)",
          }}
        >
          <Image
            src={stay.image}
            alt={stay.alt}
            fill
            className="object-cover"
            priority={isFirst}
            sizes="(max-width: 768px) 100vw, 90vw"
          />

          {/* Dark gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/22 to-black/08" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          {/* Counter */}
          <div className="absolute top-5 left-5 sm:top-6 sm:left-7">
            <span className="font-display text-[0.6rem] font-bold uppercase tracking-[0.44em] text-white/50">
              {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Tag badge — removed backdrop-blur during scroll for perf */}
          <div className="absolute top-4 right-5 sm:top-5 sm:right-6">
            <span
              className="rounded-full px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white sm:px-4 sm:py-2"
              style={{
                backgroundColor: "rgba(32,60,76,0.75)",
                border: "1px solid rgba(245,241,232,0.22)",
              }}
            >
              {stay.tag}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 lg:p-12">
            <p className="text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-white/55 mb-2 sm:mb-3">
              {stay.type}&nbsp;·&nbsp;{stay.city}, {stay.state}
            </p>
            <h3 className="font-display text-2xl sm:text-4xl lg:text-[3.4rem] font-bold text-white tracking-[-0.03em] leading-[1.05]">
              {stay.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/45 font-semibold mt-1 sm:mt-1.5 tracking-[0.1em]">
              {stay.subtitle}
            </p>
            <p className="mt-3 sm:mt-5 text-white/75 text-xs sm:text-base leading-6 sm:leading-7 max-w-[52ch]">
              {stay.description}
            </p>

            <div className="mt-4 sm:mt-7 flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                className="rounded-full px-4 py-2 text-xs sm:text-sm font-bold text-white sm:px-5 sm:py-2.5"
                style={{ backgroundColor: "rgba(199,91,26,0.88)" }}
              >
                {formatPrice(stay.pricePerNight)}&nbsp;/&nbsp;night
              </span>
              <span
                className="rounded-full px-3 py-2 text-xs sm:text-sm font-semibold text-white sm:px-4 sm:py-2.5"
                style={{
                  backgroundColor: "rgba(32,60,76,0.65)",
                  border: "1px solid rgba(245,241,232,0.2)",
                }}
              >
                ★&nbsp;{stay.rating.toFixed(1)}
              </span>
              {stay.googleMapsUrl && (
                <a
                  href={stay.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-3 py-2 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 sm:px-4 sm:py-2.5"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    border: "1.5px solid rgba(255,255,255,0.7)",
                  }}
                >
                  View on Map&nbsp;↗
                </a>
              )}
              <Link
                href={`/booking?stayId=${stay.id}`}
                className="inline-flex rounded-full px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_14px_36px_rgba(199,91,26,0.45)] transition hover:scale-105 active:scale-97 sm:px-7 sm:py-2.5"
                style={{ backgroundColor: "var(--cta)" }}
              >
                Book This Stay
              </Link>
              <Link
                href={`/property/${stay.id}`}
                className="inline-flex rounded-full px-5 py-2 text-xs sm:text-sm font-bold text-white transition hover:opacity-90 sm:px-7 sm:py-2.5"
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
      </div>
    </motion.div>
  );
}

// ─── Rotating Badge ───────────────────────────────────────────────
function RotatingBadge() {
  const text = "FEATURED STAYS · TRAYATI · EXPLORE · ";
  return (
    <div className="absolute top-8 right-8 hidden lg:block z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        className="relative size-32"
        style={{
          /* Simple opacity-based glow instead of expensive drop-shadow filter */
          willChange: "transform",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path
              id="badge-path"
              d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
            />
          </defs>
          <text
            fontSize="10"
            fill="rgba(199,91,26,0.95)"
            fontWeight="900"
            letterSpacing="2.2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            <textPath href="#badge-path">{text}</textPath>
          </text>
        </svg>
        <div
          className="absolute inset-0 m-auto size-8 rounded-full"
          style={{
            backgroundColor: "var(--gold)",
            boxShadow: "0 0 20px rgba(199,91,26,0.6)",
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────
export function FeaturedStaysSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stays } = useStays();
  const activeStays = stays.length ? stays : featuredStays;
  const total = activeStays.length;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the raw scroll progress with a spring for buttery feel
  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);

  return (
    <>
      {/* Section header */}
      <section id="featured-stays" className="px-6 sm:px-10 lg:px-16 pt-3 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.44em]"
            style={{ color: "var(--cta)" }}
          >
            Featured Stays
          </p>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2
              className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-[-0.04em] leading-[1.06] max-w-2xl"
              style={{ color: "var(--primary)" }}
            >
              Curated for the curious traveller.
            </h2>
            <p
              className="max-w-[44ch] text-sm sm:text-base leading-7 lg:text-right"
              style={{ color: "var(--foreground-soft)" }}
            >
              Each property is handpicked for its character, setting, and the
              quality of experience it delivers.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Sticky scroll zone */}
      <div
        ref={containerRef}
        style={{ height: `${total * VH_PER_CARD}vh` }}
        className="relative mt-4"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Cards */}
          <div className="relative w-full h-full">
            {activeStays.map((stay, i) => (
              <StayCard
                key={stay.id}
                stay={stay}
                index={i}
                total={total}
                scrollProgress={smoothProgress}
              />
            ))}
          </div>

          {/* Rotating badge */}
          <RotatingBadge />

          {/* Progress dots */}
          <div
            className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
            style={{ right: "clamp(0.75rem, 3vw, 2rem)" }}
          >
            {activeStays.map((_, i) => (
              <ProgressDot
                key={i}
                index={i}
                total={total}
                scrollProgress={smoothProgress}
              />
            ))}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
            <span
              className="text-[0.58rem] uppercase tracking-[0.3em]"
              style={{ color: "rgba(32,60,76,0.4)" }}
            >
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
              className="w-px h-7"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(32,60,76,0.35), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
