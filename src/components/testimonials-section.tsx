"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import { HiOutlineStar, HiOutlineXMark, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { Testimonial } from "@/data/testimonials-and-blogs";
import supabaseImageLoader from "@/lib/supabase-image-loader";

function TestimonialDialog({
  item,
  onClose,
}: {
  item: Testimonial | null;
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,26,0.55)] px-4 py-6 backdrop-blur-md sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border p-6 sm:p-8"
            style={{
              borderColor: "rgba(74,101,68,0.12)",
              background:
                "linear-gradient(145deg, rgba(250,247,240,0.98), rgba(239,231,220,0.96))",
              boxShadow: "0 30px 90px rgba(74,101,68,0.24)",
            }}
          >
            <div className="absolute right-5 top-5">
              <button
                type="button"
                onClick={onClose}
                className="flex size-11 items-center justify-center rounded-full border"
                style={{
                  borderColor: "rgba(74,101,68,0.12)",
                  backgroundColor: "rgba(255,255,255,0.72)",
                  color: "var(--primary)",
                }}
                aria-label="Close testimonial details"
              >
                <HiOutlineXMark className="text-2xl" />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 sm:h-24 sm:w-24" style={{ borderColor: "rgba(74,101,68,0.12)" }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  loader={supabaseImageLoader}
                />
              </div>

              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.26em]" style={{ backgroundColor: "rgba(164,108,43,0.12)", color: "var(--cta)" }}>
                    Guest Testimonial
                  </span>
                  <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.26em]" style={{ backgroundColor: "rgba(74,101,68,0.08)", color: "var(--primary)" }}>
                    {item.rating.toFixed(1)} / 5
                  </span>
                </div>
                <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl" style={{ color: "var(--primary)" }}>
                  {item.name}
                </h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                  {item.title}
                </p>
                <p className="mt-5 text-lg leading-8" style={{ color: "var(--foreground-soft)" }}>
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                   {item.source ? (
                     <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: "rgba(74,101,68,0.08)", color: "var(--primary)" }}>
                       {item.source}
                     </span>
                   ) : null}
                   <span className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: "rgba(13,58,82,0.12)", color: "var(--secondary)" }}>
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const SCROLL_SPEED_DESKTOP = 32;
const SCROLL_SPEED_MOBILE = 20;
const MOBILE_BUTTON_SCROLL_AMOUNT = 260;
const MOBILE_INTERACTION_RESUME_MS = 4200;

function MobileTestimonialCarousel({
  items,
  onSelect,
}: {
  items: Testimonial[];
  onSelect: (item: Testimonial) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const previousFrameRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loopItems = [...items, ...items];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    scrollPositionRef.current = el.scrollLeft;

    const tick = (timestamp: number) => {
      if (previousFrameRef.current === null) {
        previousFrameRef.current = timestamp;
      }

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const speed = isMobile ? SCROLL_SPEED_MOBILE : SCROLL_SPEED_DESKTOP;
      const deltaSeconds = (timestamp - previousFrameRef.current) / 1000;
      previousFrameRef.current = timestamp;

      if (isInteractingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      scrollPositionRef.current += speed * deltaSeconds;

      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0 && scrollPositionRef.current >= halfWidth) {
        scrollPositionRef.current -= halfWidth;
      }

      el.scrollLeft = scrollPositionRef.current;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resumeTimeoutRef.current);
      previousFrameRef.current = null;
    };
  }, []);

  const pauseForTouch = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      scrollPositionRef.current = el.scrollLeft;
    }
    isInteractingRef.current = true;
    clearTimeout(resumeTimeoutRef.current);
  }, []);

  const resumeAfterTouch = useCallback(() => {
    const syncPosition = () => {
      const el = scrollRef.current;
      if (el) {
        scrollPositionRef.current = el.scrollLeft;
      }
    };

    syncPosition();
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      syncPosition();
      previousFrameRef.current = null;
      isInteractingRef.current = false;
    }, MOBILE_INTERACTION_RESUME_MS);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    const offset = direction === "left" ? -MOBILE_BUTTON_SCROLL_AMOUNT : MOBILE_BUTTON_SCROLL_AMOUNT;
    let nextPosition = scrollPositionRef.current + offset;

    if (halfWidth > 0) {
      if (nextPosition < 0) nextPosition += halfWidth;
      if (nextPosition >= halfWidth) nextPosition -= halfWidth;
    }

    scrollPositionRef.current = nextPosition;
    el.scrollTo({ left: nextPosition, behavior: "smooth" });
  }, []);

  return (
    <div className="peek-fade mobile-carousel-touch-safe relative md:hidden">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="carousel-nav-button mobile-carousel-nav absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all"
        aria-label="Scroll testimonials left"
      >
        <HiOutlineChevronLeft className="text-2xl" />
      </button>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="carousel-nav-button mobile-carousel-nav absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all"
        aria-label="Scroll testimonials right"
      >
        <HiOutlineChevronRight className="text-2xl" />
      </button>

      <div
        ref={scrollRef}
        className="peek-carousel mobile-carousel-touch-safe"
        onPointerDown={(event) => {
          if (event.pointerType === "touch") {
            pauseForTouch();
          }
        }}
        onPointerUp={(event) => {
          if (event.pointerType === "touch") {
            resumeAfterTouch();
          }
        }}
        onPointerCancel={(event) => {
          if (event.pointerType === "touch") {
            resumeAfterTouch();
          }
        }}
      >
        {loopItems.map((testimonial, index) => (
          <button
            key={`${testimonial.id}-${index}`}
            type="button"
            onClick={() => onSelect(testimonial)}
            className="mobile-3d-card group shrink-0 overflow-hidden rounded-[1.9rem] border p-5 text-left"
            style={{
              borderColor: "rgba(74,101,68,0.12)",
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.78), rgba(245,241,233,0.88))",
              boxShadow: "0 18px 48px rgba(74,101,68,0.08)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border" style={{ borderColor: "rgba(74,101,68,0.12)" }}>
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                  loader={supabaseImageLoader}
                />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ backgroundColor: "rgba(164,108,43,0.12)", color: "var(--cta)" }}>
                <HiOutlineStar className="text-sm" />
                {testimonial.rating.toFixed(1)}
              </span>
            </div>

            <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--primary)" }}>
              {testimonial.name}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
              {testimonial.title}
            </p>
            <p className="mt-4 line-clamp-4 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>
              &ldquo;{testimonial.text}&rdquo;
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "rgba(74,101,68,0.08)" }}>
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--gold)" }}>
                {testimonial.source ?? "Guest review"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}>
                Open details
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeItem, setActiveItem] = useState<Testimonial | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const items = testimonials;

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
                  backgroundColor: "rgba(74,101,68,0.08)",
                  color: "var(--primary)",
                }}
              >
                Guest Stories
              </span>
              <h2 className="mobile-heading mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-[3.4rem]">
                Voices of Our Travelers
              </h2>
            </div>
            <p className="mobile-body-text max-w-2xl text-base leading-7 sm:text-lg" style={{ color: "var(--foreground-soft)" }}>
              Real stories from real guests who have experienced the magic of Trayati Stays.
            </p>
          </motion.div>
        </div>

        <div className="relative border-y py-6 sm:py-8" style={{ borderColor: "rgba(74,101,68,0.10)" }}>
          <div className="absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,rgba(245,241,233,0.92),transparent)] sm:w-24" />
          <div className="absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,rgba(245,241,233,0.92),transparent)] sm:w-24" />

          {/* Mobile: auto-scrolling 3D carousel with peek-ahead */}
          <MobileTestimonialCarousel
            items={items}
            onSelect={setActiveItem}
          />

          {/* Desktop: marquee carousel */}
          <div className="group/carousel relative hidden md:block">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="carousel-nav-button absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all"
              aria-label="Scroll testimonials left"
            >
              <HiOutlineChevronLeft className="text-2xl" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="carousel-nav-button absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all"
              aria-label="Scroll testimonials right"
            >
              <HiOutlineChevronRight className="text-2xl" />
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
                {carouselItems.map((testimonial, index) => (
                  <button
                    key={`${testimonial.id}-${index}`}
                    type="button"
                    onClick={() => setActiveItem(testimonial)}
                    className="ultra-3d-hover group w-[18rem] shrink-0 overflow-hidden rounded-[1.9rem] border p-5 text-left sm:w-[22rem]"
                    style={{
                      borderColor: "rgba(74,101,68,0.12)",
                      background:
                        "linear-gradient(155deg, rgba(255,255,255,0.78), rgba(245,241,233,0.88))",
                      boxShadow: "0 18px 48px rgba(74,101,68,0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border" style={{ borderColor: "rgba(74,101,68,0.12)" }}>
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-110"
                          loader={supabaseImageLoader}
                        />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ backgroundColor: "rgba(164,108,43,0.12)", color: "var(--cta)" }}>
                        <HiOutlineStar className="text-sm" />
                        {testimonial.rating.toFixed(1)}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--primary)" }}>
                      {testimonial.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                      {testimonial.title}
                    </p>
                    <p className="mt-4 line-clamp-4 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "rgba(74,101,68,0.08)" }}>
                      <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--gold)" }}>
                        {testimonial.source ?? "Guest review"}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--primary)" }}>
                        Open details
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialDialog item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
