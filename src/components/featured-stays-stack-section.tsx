"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { FeaturedStay } from "@/data/featured-stays";
import { useStays } from "@/hooks/use-stays";
import supabaseImageLoader from "@/lib/supabase-image-loader";

const SPRING_CONFIG = { stiffness: 140, damping: 26, mass: 0.45 };
const CARD_STEP = 22;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function ProgressDot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const step = total > 1 ? 1 / (total - 1) : 1;
  const start = index * step;
  const opacity = useTransform(
    progress,
    [start - step * 0.45, start, start + step * 0.45],
    [0.28, 1, 0.28]
  );
  const scale = useTransform(
    progress,
    [start - step * 0.45, start, start + step * 0.45],
    [0.82, 1.4, 0.82]
  );

  return (
    <motion.div
      className="h-2 w-2 rounded-full"
      style={{
        opacity,
        scale,
        backgroundColor: "var(--primary)",
      }}
    />
  );
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
  const cardRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 1], [1.1, 1, 0.98]),
    SPRING_CONFIG
  );
  const cardScale = useSpring(
    useTransform(scrollYProgress, [0, 0.4, 1], [0.94, 1, 0.975]),
    SPRING_CONFIG
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 1], [80, 0, -30]),
    SPRING_CONFIG
  );
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0.78, 0.48, 0.58]);

  return (
    <article
      ref={cardRef}
      className="relative"
      style={{
        minHeight: index === total - 1 ? "88vh" : "112vh",
      }}
    >
      <motion.div
        className="sticky"
        style={{
          top: `calc(clamp(4.5rem, 10vh, 6.75rem) + ${index * CARD_STEP}px)`,
          scale: cardScale,
          y: translateY,
          zIndex: total - index,
          willChange: "transform",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[var(--surface)] shadow-[0_28px_90px_rgba(30,41,24,0.20)]"
          style={{
            minHeight: "min(76vh, 760px)",
          }}
        >
          <div className="grid min-h-[inherit] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[340px] lg:min-h-[inherit]">
              <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
                <Image
                  src={stay.image}
                  alt={stay.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-cover"
                  loader={supabaseImageLoader}
                />
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/12 lg:via-transparent lg:to-transparent"
                style={{ opacity: overlayOpacity }}
              />
              <div className="absolute left-5 top-5 flex items-center gap-3 sm:left-7 sm:top-7">
                <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.32em] text-white/80 backdrop-blur-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                  {stay.tag}
                </span>
              </div>
            </div>

            <div className="relative flex flex-col justify-between gap-8 bg-[linear-gradient(180deg,rgba(245,241,233,0.96),rgba(245,241,233,0.90))] p-6 sm:p-8 lg:p-10">
              <div className="space-y-5">
                <p
                  className="text-[0.68rem] font-bold uppercase tracking-[0.42em]"
                  style={{ color: "var(--cta)" }}
                >
                  {stay.type} . {stay.city}, {stay.state}
                </p>
                <div className="space-y-3">
                  <h3
                    className="font-display text-3xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-4xl lg:text-[3.2rem]"
                    style={{ color: "var(--primary)" }}
                  >
                    {stay.title}
                  </h3>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--foreground-soft)]">
                    {stay.subtitle}
                  </p>
                </div>
                <p
                  className="max-w-[34ch] text-sm leading-7 sm:text-[0.98rem]"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  {stay.description}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2.5">
                  {stay.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border px-3.5 py-2 text-xs font-semibold"
                      style={{
                        borderColor: "rgba(74,101,68,0.15)",
                        color: "var(--foreground-soft)",
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full px-4 py-2 text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--button-primary)" }}
                  >
                    {formatPrice(stay.pricePerNight)} / night
                  </span>
                  <span
                    className="rounded-full border px-4 py-2 text-sm font-semibold"
                    style={{
                      borderColor: "rgba(164,108,43,0.22)",
                      color: "var(--foreground)",
                      backgroundColor: "rgba(255,255,255,0.75)",
                    }}
                  >
                    {stay.rating.toFixed(1)} star rating
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/property/${stay.id}`}
                    className="inline-flex rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-[var(--button-primary-hover)]"
                  >
                    View details
                  </Link>
                  <Link
                    href={`/booking?stayId=${stay.id}`}
                    className="inline-flex rounded-full border px-6 py-3 text-sm font-bold transition hover:bg-white"
                    style={{
                      borderColor: "rgba(74,101,68,0.18)",
                      color: "var(--primary)",
                    }}
                  >
                    Book this stay
                  </Link>
                  {stay.googleMapsUrl ? (
                    <a
                      href={stay.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-white"
                      style={{
                        borderColor: "rgba(74,101,68,0.14)",
                        color: "var(--foreground-soft)",
                      }}
                    >
                      View on map
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

export function FeaturedStaysStackSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { stays, isLoading, error } = useStays();
  const activeStays = stays.filter((stay) => stay.isFeatured === true);
  const total = activeStays.length;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, SPRING_CONFIG);

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
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-8 sm:px-10 lg:px-16 lg:py-12"
    >
      <div
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(164,108,43,0.12), transparent 48%), radial-gradient(circle at top right, rgba(74,101,68,0.14), transparent 40%)",
        }}
      />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.44em]"
              style={{ color: "var(--cta)" }}
            >
              Featured Stays
            </p>
            <div className="space-y-4">
              <h2
                className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[4rem]"
                style={{ color: "var(--primary)" }}
              >
                Sticky cards, slow reveal, stronger presence.
              </h2>
              <p
                className="max-w-[34ch] text-sm leading-7 sm:text-base"
                style={{ color: "var(--foreground-soft)" }}
              >
                Each stay now holds its position while the next one layers in, creating the
                stacked editorial scroll effect you asked for.
              </p>
            </div>

            <div className="flex items-center gap-3 lg:pt-2">
              {activeStays.map((stay, index) => (
                <ProgressDot
                  key={stay.id}
                  index={index}
                  total={total}
                  progress={smoothProgress}
                />
              ))}
            </div>

            <p
              className="text-[0.68rem] font-semibold uppercase tracking-[0.32em]"
              style={{ color: "rgba(74,101,68,0.54)" }}
            >
              Scroll to move through the collection
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {activeStays.map((stay, index) => (
            <StayCard key={stay.id} stay={stay} index={index} total={total} />
          ))}
        </div>
      </div>
    </section>
  );
}
