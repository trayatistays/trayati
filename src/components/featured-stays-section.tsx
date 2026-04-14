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

const VH_PER_CARD = 110;
const SPRING_CONFIG = { stiffness: 350, damping: 35, mass: 0.2 };

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
  onClick,
}: {
  index: number;
  scrollProgress: MotionValue<number>;
  total: number;
  onClick: () => void;
}) {
  const s = index / total;
  const e = (index + 1) / total;
  const buf = 0.04;

  const opacity = useTransform(
    scrollProgress,
    [Math.max(0, s - buf), s, Math.min(1, e - buf), Math.min(1, e)],
    [0.3, 1, 1, 0.3]
  );

  const scale = useTransform(
    scrollProgress,
    [Math.max(0, s - buf), s, Math.min(1, e - buf), Math.min(1, e)],
    [0.6, 1.3, 1.3, 0.6]
  );

  const glow = useTransform(
    scrollProgress,
    [Math.max(0, s - buf), s, Math.min(1, e - buf), Math.min(1, e)],
    ["0px 0px 0px rgba(199,91,26,0)", "0px 0px 8px rgba(199,91,26,0.6)", "0px 0px 8px rgba(199,91,26,0.6)", "0px 0px 0px rgba(199,91,26,0)"]
  );

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.5 }}
      style={{
        opacity,
        scale,
        width: 7,
        height: 7,
        borderRadius: "50%",
        backgroundColor: "rgba(245,241,232,0.9)",
        boxShadow: glow,
        cursor: "pointer",
        border: "none",
        outline: "none",
        transition: "background-color 0.3s ease",
      }}
    />
  );
}

// ─── Stay Card (Desktop) ──────────────────────────────────────────
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

  const prevSegStart = isFirst ? 0 : (index - 1) / total;
  const prevSegEnd = isFirst ? 0 : index / total;

  const rawY = useTransform(
    scrollProgress,
    isFirst ? [0, 1] : [prevSegStart, prevSegEnd],
    isFirst ? [0, 0] : [100, 0]
  );
  const springY = useSpring(rawY, SPRING_CONFIG);
  const y = useTransform(springY, (v) => `${v}vh`);

  const scaleStart = segStart + (segEnd - segStart) * 0.5;
  const rawScale = useTransform(
    scrollProgress,
    isLast ? [0, 1] : [scaleStart, segEnd],
    isLast ? [1, 1] : [1, 0.85]
  );
  const scale = useSpring(rawScale, SPRING_CONFIG);

  const rawBrightness = useTransform(
    scrollProgress,
    isLast ? [0, 1] : [scaleStart, segEnd],
    isLast ? [1, 1] : [1, 0.7]
  );
  const brightness = useSpring(rawBrightness, SPRING_CONFIG);
  const filter = useTransform(brightness, (v) => `brightness(${v})`);

  const imageY = useTransform(
    scrollProgress,
    [segStart, segEnd],
    ["-8%", "8%"]
  );

  const zIndex = index + 1;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        scale,
        y: isFirst ? 0 : y,
        zIndex,
        filter,
        willChange: "transform, filter",
      }}
    >
      <div className="relative w-full h-full p-4 sm:p-6 lg:p-8">
        <div
          className="relative w-full h-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#1a2f3d]"
          style={{
            boxShadow:
              "0 32px 80px rgba(32,60,76,0.28), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <motion.div
            style={{ y: imageY, height: "120%", top: "-10%" }}
            className="absolute inset-x-0"
          >
            <Image
              src={stay.image}
              alt={stay.alt}
              fill
              className="object-cover"
              priority={isFirst}
              sizes="(max-width: 768px) 100vw, 90vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/5 to-transparent" />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 20% 80%, rgba(199,91,26,0.08) 0%, transparent 60%)",
            }}
          />

          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <span className="font-display text-[0.55rem] font-bold uppercase tracking-[0.5em] text-white/40">
              {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
            </span>
          </div>

          <div className="absolute top-5 right-6 sm:top-7 sm:right-8">
            <span
              className="rounded-full px-4 py-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-md sm:px-5 sm:py-2.5"
              style={{
                backgroundColor: "rgba(32,60,76,0.45)",
                border: "1px solid rgba(245,241,232,0.12)",
              }}
            >
              {stay.tag}
            </span>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 lg:p-14">
            <p className="text-[0.5rem] sm:text-[0.55rem] font-semibold uppercase tracking-[0.45em] text-white/45 mb-3 sm:mb-4">
              {stay.type}&nbsp;·&nbsp;{stay.city}, {stay.state}
            </p>
            <h3 className="font-display text-3xl sm:text-5xl lg:text-[4rem] font-bold text-white tracking-[-0.035em] leading-[1.02]">
              {stay.title}
            </h3>
            <p className="text-[0.7rem] sm:text-xs text-white/35 font-semibold mt-2 sm:mt-2.5 tracking-[0.12em] uppercase">
              {stay.subtitle}
            </p>
            <p className="mt-4 sm:mt-6 text-white/65 text-sm sm:text-base leading-7 sm:leading-[1.85] max-w-[48ch]">
              {stay.description}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span
                className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold text-white backdrop-blur-sm sm:px-6 sm:py-3"
                style={{
                  background: "linear-gradient(135deg, rgba(199,91,26,0.92) 0%, rgba(180,70,15,0.95) 100%)",
                  boxShadow: "0 4px 20px rgba(199,91,26,0.35)",
                }}
              >
                {formatPrice(stay.pricePerNight)}&nbsp;/&nbsp;night
              </span>
              <span
                className="rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-md sm:px-5 sm:py-3"
                style={{
                  backgroundColor: "rgba(32,60,76,0.4)",
                  border: "1px solid rgba(245,241,232,0.1)",
                }}
              >
                ★&nbsp;{stay.rating.toFixed(1)}
              </span>
              {stay.googleMapsUrl && (
                <a
                  href={stay.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:text-white hover:bg-white/15 sm:px-5 sm:py-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(245,241,232,0.12)",
                  }}
                >
                  View on Map&nbsp;↗
                </a>
              )}
              <Link
                href={`/booking?stayId=${stay.id}`}
                className="inline-flex rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_18px_44px_rgba(199,91,26,0.55)] hover:scale-[1.03] active:scale-[0.98] sm:px-8 sm:py-3"
                style={{
                  background: "linear-gradient(135deg, var(--cta) 0%, #b0460f 100%)",
                  boxShadow: "0 8px 32px rgba(199,91,26,0.4)",
                }}
              >
                Book This Stay
              </Link>
              <Link
                href={`/property/${stay.id}`}
                className="inline-flex rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold text-white/85 backdrop-blur-md transition-all duration-300 hover:text-white hover:bg-white/18 sm:px-7 sm:py-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(245,241,232,0.15)",
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
        transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        className="relative size-28"
        style={{ willChange: "transform" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path
              id="badge-path"
              d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
            />
          </defs>
          <text
            fontSize="9.5"
            fill="rgba(199,91,26,0.85)"
            fontWeight="800"
            letterSpacing="2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            <textPath href="#badge-path">{text}</textPath>
          </text>
        </svg>
        <div
          className="absolute inset-0 m-auto size-7 rounded-full"
          style={{
            background: "linear-gradient(135deg, var(--gold) 0%, #d4a053 100%)",
            boxShadow: "0 0 24px rgba(199,91,26,0.5), 0 0 8px rgba(199,91,26,0.3)",
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
  const topFeatured = activeStays
    .filter((s) => s.isFeatured)
    .slice(0, 2);
  const total = topFeatured.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);

  const scrollToItem = (index: number) => {
    if (!containerRef.current) return;
    const startOffset = containerRef.current.offsetTop;
    const viewportHeight = window.innerHeight;
    const targetScroll = startOffset + (index * VH_PER_CARD * viewportHeight) / 100;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  if (total === 0) return null;

  return (
    <>
      <section id="featured-stays" className="px-6 sm:px-10 lg:px-16 pt-16 pb-8 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 mb-5">
            <div
              className="h-px flex-1 max-w-[2rem]"
              style={{ background: "linear-gradient(to right, var(--cta), transparent)" }}
            />
            <p
              className="text-[0.65rem] font-bold uppercase tracking-[0.5em]"
              style={{ color: "var(--cta)" }}
            >
              Featured Stays
            </p>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(to right, var(--cta), transparent)" }}
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2
              className="font-display text-3xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-[-0.04em] leading-[1.05] max-w-2xl"
              style={{ color: "var(--primary)" }}
            >
              Curated for the curious traveller.
            </h2>
            <p
              className="max-w-[40ch] text-sm sm:text-base leading-7 lg:text-right"
              style={{ color: "var(--foreground-soft)" }}
            >
              Each property is handpicked for its character, setting, and the quality of experience it delivers.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Scroll-Linked Layout (Desktop & Mobile) ── */}
      <div
        ref={containerRef}
        style={{ height: `${total * VH_PER_CARD}vh` }}
        className="relative mt-2"
      >
        <div className="sticky top-[12vh] md:top-0 h-[76vh] md:h-screen overflow-hidden">
          <div className="relative w-full h-full">
            {topFeatured.map((stay, i) => (
              <StayCard
                key={stay.id}
                stay={stay}
                index={i}
                total={total}
                scrollProgress={smoothProgress}
              />
            ))}
          </div>

          <RotatingBadge />

          <div
            className="absolute top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3.5 backdrop-blur-sm rounded-full px-1.5 py-3"
            style={{
              right: "clamp(1rem, 3vw, 2.5rem)",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(245,241,232,0.06)",
            }}
          >
            {topFeatured.map((_, i) => (
              <ProgressDot
                key={i}
                index={i}
                total={total}
                scrollProgress={smoothProgress}
                onClick={() => scrollToItem(i)}
              />
            ))}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-none">
            <span
              className="text-[0.5rem] uppercase tracking-[0.35em] font-medium"
              style={{ color: "rgba(245,241,232,0.35)" }}
            >
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-px h-8"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(199,91,26,0.4), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
