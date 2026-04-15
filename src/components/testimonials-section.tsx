"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
import { HiOutlineStar, HiOutlineXMark } from "react-icons/hi2";
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

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem("trayati-testimonials");
      if (!raw) return [];
      const { data, ts } = JSON.parse(raw) as { data: Testimonial[]; ts: number };
      const STALE_MS = 5 * 60 * 1000;
      if (Date.now() - ts < STALE_MS) return data;
    } catch {}
    return [];
  });
  const [activeItem, setActiveItem] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(() => items.length === 0);

  useEffect(() => {
    if (items.length > 0) return;

    let active = true;

    void fetch("/api/testimonials", {
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { testimonials?: Testimonial[] } | null) => {
        if (!active) return;
        const fetched = data?.testimonials ?? [];
        setItems(fetched);
        try {
          sessionStorage.setItem("trayati-testimonials", JSON.stringify({ data: fetched, ts: Date.now() }));
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

          {/* Mobile: horizontal-scrolling carousel with peek-ahead */}
          <div className="testimonials-peek testimonials-carousel relative md:hidden">
            {items.map((testimonial, index) => (
              <button
                key={`${testimonial.id}-${index}`}
                type="button"
                onClick={() => setActiveItem(testimonial)}
                className="group shrink-0 overflow-hidden rounded-[1.9rem] border p-5 text-left"
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

          {/* Desktop: marquee carousel */}
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] hidden md:block">
            <div
              className="marquee-track marquee-track--hover-slow flex w-max gap-5 px-4 sm:px-6 lg:px-10"
              style={
                {
                  "--marquee-duration": "38s",
                  "--marquee-duration-hover": "68s",
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
      </section>

      <TestimonialDialog item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
