"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { featuredStays, type FeaturedStay } from "@/data/featured-stays";
import { useStays } from "@/hooks/use-stays";

// ─── Constants ────────────────────────────────────────────────────
// 125vh per card → 500vh total → 400vh effective scroll range with ["end end"] offset
// Each card gets exactly 100vh of scroll (500vh - 100vh viewport = 400vh ÷ 4)
const VH_PER_CARD = 125;

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
  scrollYProgress,
  total,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
  total: number;
}) {
  const s = index / total;
  const e = (index + 1) / total;
  const buf = 0.04;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, s - buf), s, Math.min(1, e - buf), Math.min(1, e)],
    [0.28, 1, 1, 0.28]
  );
  const scale = useTransform(
    scrollYProgress,
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
// Dingbat-style stacking: each new card slides UP from below while
// the current card scales to 0.9 — both within the same scroll window.
// No fade/disappear: old cards just sit behind (lower z-index).
function StayCard({
  stay,
  index,
  scrollYProgress,
  total,
}: {
  stay: FeaturedStay;
  index: number;
  scrollYProgress: MotionValue<number>;
  total: number;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const segStart = index / total; // when THIS card becomes active
  const segEnd = (index + 1) / total; // when NEXT card becomes active

  // ── Scale down ──────────────────────────────────────────────────
  // This card scales from 1 → 0.9 while the NEXT card is sliding in.
  // For the last card: stays at 1.0 (no card coming after).
  const scale = useTransform(
    scrollYProgress,
    isLast ? [0, 1] : [segStart, segEnd],
    isLast ? [1, 1] : [1, 0.9]
  );

  // ── Slide in from below ──────────────────────────────────────────
  // This card slides from y="100%" to y="0%" over the PREVIOUS card's segment.
  // For card 0: already in place (no animation).
  const prevSegStart = (index - 1) / total;
  const prevSegEnd = index / total;
  const y = useTransform(
    scrollYProgress,
    isFirst ? [0, 1] : [prevSegStart, prevSegEnd],
    isFirst ? ["0%", "0%"] : ["100%", "0%"]
  );

  // z-index: each successive card sits on top (3, 4, 5, 6 for N=4)
  // No dynamic z-index needed — the slide-in naturally creates the stacking order.
  const zIndex = index + 1;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ scale, y, zIndex }}
    >
      {/* Gutter around card (like dingbat.co.in) — cream BG shows through */}
      <div className="relative w-full h-full p-4 sm:p-5 lg:p-6">
        <div
          className="relative w-full h-full overflow-hidden rounded-[2rem]"
          style={{
            boxShadow:
              "0 40px 100px rgba(32,60,76,0.25), 0 3px 0 2px rgba(32,60,76,0.06), 0 6px 0 4px rgba(32,60,76,0.04)",
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
          <div className="absolute top-6 left-7">
            <span className="font-display text-[0.6rem] font-bold uppercase tracking-[0.44em] text-white/50">
              {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Tag badge */}
          <div className="absolute top-5 right-6">
            <span
              className="rounded-full px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-md"
              style={{
                backgroundColor: "rgba(32,60,76,0.65)",
                border: "1px solid rgba(245,241,232,0.22)",
              }}
            >
              {stay.tag}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 inset-x-0 p-7 sm:p-10 lg:p-12">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-white/55 mb-3">
              {stay.type}&nbsp;·&nbsp;{stay.city}, {stay.state}
            </p>
            <h3 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-white tracking-[-0.03em] leading-[1.05]">
              {stay.title}
            </h3>
            <p className="text-sm text-white/45 font-semibold mt-1.5 tracking-[0.1em]">
              {stay.subtitle}
            </p>
            <p className="mt-5 text-white/75 text-sm sm:text-base leading-7 max-w-[52ch]">
              {stay.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-5 py-2.5 text-sm font-bold text-white"
                style={{ backgroundColor: "rgba(199,91,26,0.88)" }}
              >
                {formatPrice(stay.pricePerNight)}&nbsp;/&nbsp;night
              </span>
              <span
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(32,60,76,0.55)",
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
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-white/72 backdrop-blur-md transition hover:text-white"
                  style={{
                    backgroundColor: "rgba(32,60,76,0.45)",
                    border: "1px solid rgba(245,241,232,0.16)",
                  }}
                >
                  View on Map&nbsp;↗
                </a>
              )}
              <Link
                href={`/booking?stayId=${stay.id}`}
                className="inline-flex rounded-full px-7 py-2.5 text-sm font-bold text-white shadow-[0_14px_36px_rgba(199,91,26,0.45)] transition hover:scale-105 active:scale-97"
                style={{ backgroundColor: "var(--cta)" }}
              >
                Book This Stay
              </Link>
              <Link
                href={`/property/${stay.id}`}
                className="inline-flex rounded-full px-7 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(32,60,76,0.35)] transition hover:scale-105 active:scale-97"
                style={{
                  backgroundColor: "rgba(32,60,76,0.75)",
                  border: "1px solid rgba(245,241,232,0.3)",
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
          filter: "drop-shadow(0 0 20px rgba(199,91,26,0.6)) drop-shadow(0 0 40px rgba(199,91,26,0.3))",
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
          className="absolute inset-0 m-auto size-8 rounded-full shadow-lg"
          style={{
            backgroundColor: "var(--gold)",
            boxShadow: "0 0 30px rgba(199,91,26,0.8), 0 0 60px rgba(199,91,26,0.4)",
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

  return (
    <>
      {/* Section header */}
      <section id="featured-stays" className="px-6 sm:px-10 lg:px-16 pt-4 pb-6">
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
              Curated for the intentional traveller.
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
                scrollYProgress={scrollYProgress}
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
                scrollYProgress={scrollYProgress}
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
