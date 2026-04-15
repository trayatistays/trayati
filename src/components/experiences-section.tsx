"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";
import { HiMiniArrowUpRight, HiOutlineClock, HiOutlineXMark, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { Experience } from "@/data/testimonials-and-blogs";
import supabaseImageLoader from "@/lib/supabase-image-loader";

function ExperienceDialog({
  item,
  onClose,
}: {
  item: Experience | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,26,0.58)] px-4 py-6 backdrop-blur-md sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border"
            style={{
              borderColor: "rgba(74,101,68,0.12)",
              background:
                "linear-gradient(150deg, rgba(250,247,240,0.98), rgba(239,231,220,0.96))",
              boxShadow: "0 30px 90px rgba(74,101,68,0.24)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full border"
              style={{
                borderColor: "rgba(245,241,233,0.22)",
                backgroundColor: "rgba(74,101,68,0.72)",
                color: "#fff",
              }}
              aria-label="Close experience details"
            >
              <HiOutlineXMark className="text-2xl" />
            </button>

            <div className="grid lg:grid-cols-[1fr_0.95fr]">
              <div className="relative min-h-[16rem] lg:min-h-[32rem]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  loader={supabaseImageLoader}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,101,68,0.08),rgba(74,101,68,0.72))]" />
                <div className="absolute inset-x-5 bottom-5">
                  <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white" style={{ backgroundColor: "rgba(164,108,43,0.88)" }}>
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em]" style={{ backgroundColor: "rgba(74,101,68,0.08)", color: "var(--primary)" }}>
                    Editorial Story
                  </span>
                  {item.readTime ? (
                     <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: "rgba(13,58,82,0.12)", color: "var(--secondary)" }}>
                      <HiOutlineClock className="text-sm" />
                      {item.readTime} min read
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl" style={{ color: "var(--primary)" }}>
                  {item.title}
                </h3>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                  {(item.author ?? "Trayati Editorial")} | {item.date}
                </p>

                <p className="mt-6 text-base leading-8 sm:text-lg" style={{ color: "var(--foreground-soft)" }}>
                  {item.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/blogs"
                    onClick={onClose}
                    className="cta-min-target inline-flex items-center gap-3 rounded-full bg-[var(--button-primary)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--button-primary-hover)]"
                  >
                    Explore stories
                    <HiMiniArrowUpRight className="text-lg" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const EXP_SCROLL_SPEED_DESKTOP = 0.5;
const EXP_SCROLL_SPEED_MOBILE = 0.25;
const EXP_RESUME_DELAY_MS = 3000;

function MobileExperienceCarousel({
  items,
  onSelect,
}: {
  items: Experience[];
  onSelect: (item: Experience) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loopItems = [...items, ...items];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const tick = () => {
      if (!isPausedRef.current) {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const speed = isMobile ? EXP_SCROLL_SPEED_MOBILE : EXP_SCROLL_SPEED_DESKTOP;
        el.scrollLeft += speed;
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft = 0;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    clearTimeout(timeoutRef.current);
  }, []);

  const resume = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, EXP_RESUME_DELAY_MS);
  }, []);

  return (
    <div
      className="peek-fade relative md:hidden"
      onTouchStart={pause}
      onTouchEnd={resume}
      onMouseDown={pause}
      onMouseUp={resume}
    >
      <div ref={scrollRef} className="peek-carousel">
        {loopItems.map((experience, index) => (
          <button
            key={`${experience.id}-${index}`}
            type="button"
            onClick={() => onSelect(experience)}
            className="mobile-3d-card group shrink-0 overflow-hidden rounded-[1.9rem] border text-left"
            style={{
              borderColor: "rgba(74,101,68,0.12)",
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.78), rgba(245,241,233,0.88))",
              boxShadow: "0 18px 48px rgba(74,101,68,0.08)",
            }}
          >
            <div className="relative h-56 overflow-hidden">
              <Image
                src={experience.image}
                alt={experience.title}
                fill
                className="object-cover"
                loader={supabaseImageLoader}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(74,101,68,0.82)_100%)]" />
              <div className="absolute inset-x-5 bottom-5">
                <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-white" style={{ backgroundColor: "rgba(164,108,43,0.88)" }}>
                  {experience.category}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                  {experience.author ?? "Trayati Editorial"}
                </p>
                {experience.readTime ? (
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
                    <HiOutlineClock className="text-sm" />
                    {experience.readTime} min
                  </span>
                ) : null}
              </div>

              <h3 className="mt-4 line-clamp-2 font-display text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--primary)" }}>
                {experience.title}
              </h3>
              <p className="mt-4 line-clamp-3 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>
                {experience.description}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "rgba(74,101,68,0.08)" }}>
                <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--cta)" }}>
                  {experience.date}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}>
                  Open story
                  <HiMiniArrowUpRight className="text-sm" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExperiencesSection() {
  const [items, setItems] = useState<Experience[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem("trayati-experiences");
      if (!raw) return [];
      const { data, ts } = JSON.parse(raw) as { data: Experience[]; ts: number };
      const STALE_MS = 5 * 60 * 1000;
      if (Date.now() - ts < STALE_MS) return data;
    } catch {}
    return [];
  });
  const [activeItem, setActiveItem] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(() => items.length === 0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (items.length > 0) return;

    let active = true;

    void fetch("/api/experiences", {
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { experiences?: Experience[] } | null) => {
        if (!active) return;
        const fetched = data?.experiences ?? [];
        setItems(fetched);
        try {
          sessionStorage.setItem("trayati-experiences", JSON.stringify({ data: fetched, ts: Date.now() }));
        } catch {}
      })
      .finally(() => {
        if (active) setIsLoading(false);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [items.length]);

  if (isLoading && items.length === 0) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  const carouselItems = [...items, ...items];

  return (
    <>
      <section className="relative w-full overflow-hidden px-0 py-16 sm:py-24 lg:py-32">
        <div className="px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <span
                className="inline-block rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.3em]"
                style={{
                  backgroundColor: "rgba(199,91,26,0.1)",
                  color: "var(--cta)",
                }}
              >
                Travel Stories & Insights
              </span>
              <h2 className="mobile-heading mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-[3.4rem]">
                Turn Trips Into Timeless Memories
              </h2>
            </div>
            <p className="mobile-body-text max-w-2xl text-base leading-7 sm:text-lg" style={{ color: "var(--foreground-soft)" }}>
              From hidden gems to popular escapes, discover stories that inspire your next journey.
            </p>
          </motion.div>
        </div>

        <div className="relative border-y py-6 sm:py-8" style={{ borderColor: "rgba(74,101,68,0.10)" }}>
          <div className="absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,rgba(245,241,233,0.92),transparent)] sm:w-24" />
          <div className="absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,rgba(245,241,233,0.92),transparent)] sm:w-24" />

          {/* Mobile: auto-scrolling 3D carousel with peek-ahead */}
          <MobileExperienceCarousel
            items={items}
            onSelect={setActiveItem}
          />

          {/* Desktop: marquee carousel */}
          <div className="group/carousel relative hidden md:block">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border bg-white/10 opacity-0 backdrop-blur-md transition-all hover:bg-white/20 group-hover/carousel:opacity-100"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <HiOutlineChevronLeft className="text-2xl text-white" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border bg-white/10 opacity-0 backdrop-blur-md transition-all hover:bg-white/20 group-hover/carousel:opacity-100"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <HiOutlineChevronRight className="text-2xl text-white" />
            </button>

            <div 
              ref={scrollContainerRef}
              className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] scroll-smooth"
            >
              <div
                className="marquee-track marquee-track--hover-slow flex w-max gap-5 px-4 sm:px-6 lg:px-10"
                style={
                  {
                    "--marquee-duration": "60s",
                    "--marquee-duration-hover": "100s",
                    "--marquee-direction": "normal",
                  } as CSSProperties
                }
              >
                {carouselItems.map((experience, index) => (
                  <button
                    key={`${experience.id}-${index}`}
                    type="button"
                    onClick={() => setActiveItem(experience)}
                    className="ultra-3d-hover group w-[19rem] shrink-0 overflow-hidden rounded-[1.9rem] border text-left sm:w-[25rem]"
                    style={{
                      borderColor: "rgba(74,101,68,0.12)",
                      background:
                        "linear-gradient(155deg, rgba(255,255,255,0.78), rgba(245,241,233,0.88))",
                      boxShadow: "0 18px 48px rgba(74,101,68,0.08)",
                    }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        loader={supabaseImageLoader}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(74,101,68,0.82)_100%)]" />
                      <div className="absolute inset-x-5 bottom-5">
                        <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-white" style={{ backgroundColor: "rgba(164,108,43,0.88)" }}>
                          {experience.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                          {experience.author ?? "Trayati Editorial"}
                        </p>
                        {experience.readTime ? (
                          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
                            <HiOutlineClock className="text-sm" />
                            {experience.readTime} min
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 line-clamp-2 font-display text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--primary)" }}>
                        {experience.title}
                      </h3>
                      <p className="mt-4 line-clamp-3 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>
                        {experience.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "rgba(74,101,68,0.08)" }}>
                        <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--cta)" }}>
                          {experience.date}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}>
                          Open story
                          <HiMiniArrowUpRight className="text-sm" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 px-4 text-center sm:px-6 lg:px-10"
        >
          <Link
            href="/blogs"
            className="cta-min-target group inline-flex items-center gap-3 rounded-full bg-[var(--button-primary)] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--button-primary-hover)]"
          >
            <span>Explore All Stories</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
          </Link>
        </motion.div>
      </section>

      <ExperienceDialog item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
