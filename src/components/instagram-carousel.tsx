"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { FaInstagram } from "react-icons/fa6";
import { HiMiniArrowUpRight, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { InstagramMediaItem } from "@/lib/instagram";
import { socialLinks } from "@/data/social-links";

const AUTO_SCROLL_SPEED_DESKTOP = 20;
const AUTO_SCROLL_SPEED_MOBILE = 6;
const INTERACTION_COOLDOWN_MS = 1800;

export function InstagramCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);
  const interactionLockUntilRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const isHoveringRef = useRef(false);
  const isFocusedWithinRef = useRef(false);
  const [items, setItems] = useState<InstagramMediaItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem("trayati-instagram");
      if (!raw) return [];
      const { data, ts } = JSON.parse(raw) as { data: { items: InstagramMediaItem[]; usingFallback: boolean }; ts: number };
      const STALE_MS = 15 * 60 * 1000;
      if (Date.now() - ts < STALE_MS && data.items.length > 0) {
        return [...data.items, ...data.items];
      }
    } catch { }
    return [];
  });
  const [usingFallback, setUsingFallback] = useState(true);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (items.length > 0) return;

    let active = true;

    void fetch("/api/instagram-feed", {
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { items?: InstagramMediaItem[]; usingFallback?: boolean } | null) => {
        if (!active || !payload?.items?.length) {
          return;
        }

        setItems([...payload.items, ...payload.items]);
        setUsingFallback(Boolean(payload.usingFallback));
        try {
          sessionStorage.setItem("trayati-instagram", JSON.stringify({
            data: { items: payload.items, usingFallback: payload.usingFallback },
            ts: Date.now(),
          }));
        } catch { }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [items.length]);

  useEffect(() => {
    isPointerDownRef.current = isPointerDown;
  }, [isPointerDown]);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useEffect(() => {
    isFocusedWithinRef.current = isFocusedWithin;
  }, [isFocusedWithin]);

  const lockInteraction = (duration = INTERACTION_COOLDOWN_MS) => {
    interactionLockUntilRef.current = Date.now() + duration;
  };

  useEffect(() => {
    if (!items.length || prefersReducedMotion) {
      return;
    }

    const loopTrackScroll = (timestamp: number) => {
      const track = trackRef.current;

      if (!track) {
        animationFrameRef.current = window.requestAnimationFrame(loopTrackScroll);
        return;
      }

      if (previousFrameRef.current === null) {
        previousFrameRef.current = timestamp;
      }

      const halfWidth = track.scrollWidth / 2;
      const deltaSeconds = (timestamp - previousFrameRef.current) / 1000;
      previousFrameRef.current = timestamp;
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const speed = isMobile ? AUTO_SCROLL_SPEED_MOBILE : AUTO_SCROLL_SPEED_DESKTOP;

      if (
        halfWidth > 0 &&
        !isPointerDownRef.current &&
        !isHoveringRef.current &&
        !isFocusedWithinRef.current &&
        Date.now() >= interactionLockUntilRef.current
      ) {
        track.scrollLeft += speed * deltaSeconds;

        if (track.scrollLeft >= halfWidth) {
          track.scrollLeft -= halfWidth;
        }
      } else if (halfWidth > 0 && track.scrollLeft < 0) {
        track.scrollLeft += halfWidth;
      }

      animationFrameRef.current = window.requestAnimationFrame(loopTrackScroll);
    };

    animationFrameRef.current = window.requestAnimationFrame(loopTrackScroll);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      previousFrameRef.current = null;
    };
  }, [items.length, prefersReducedMotion]);

  const normalizeInfiniteScroll = () => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const halfWidth = track.scrollWidth / 2;

    if (halfWidth === 0) {
      return;
    }

    if (track.scrollLeft >= halfWidth) {
      track.scrollLeft -= halfWidth;
    }

    if (track.scrollLeft < 0) {
      track.scrollLeft += halfWidth;
    }
  };

  const nudgeTrack = (offset: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    lockInteraction();
    track.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    pointerStartRef.current = {
      x: event.clientX,
      scrollLeft: track.scrollLeft,
    };
    setIsPointerDown(true);
    lockInteraction(2600);
    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isPointerDown || !pointerStartRef.current) {
      return;
    }

    const track = trackRef.current;

    if (!track) {
      return;
    }

    const deltaX = event.clientX - pointerStartRef.current.x;
    track.scrollLeft = pointerStartRef.current.scrollLeft - deltaX;
    normalizeInfiniteScroll();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    pointerStartRef.current = null;
    setIsPointerDown(false);
    lockInteraction();
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (dominantDelta === 0) {
      return;
    }

    event.preventDefault();
    track.scrollLeft += dominantDelta;
    normalizeInfiniteScroll();
    lockInteraction();
  };

  if (!items.length) {
    return null;
  }

  return (
    <section className="relative w-full px-0 py-16 sm:py-24 lg:py-32">
      <div className="relative w-full overflow-hidden border-y px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16" style={{ borderColor: "rgba(74,101,68,0.10)" }}>
        <div className="absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,rgba(245,241,233,0.92),transparent)] sm:w-20" />
        <div className="absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,rgba(245,241,233,0.92),transparent)] sm:w-20" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: "var(--gold)" }}>
              Instagram Journal
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl" style={{ color: "var(--primary)" }}>
              The visual diary of Trayati
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={socialLinks.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="ultra-3d-hover inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
              style={{
                color: "var(--primary)",
                borderColor: "rgba(74,101,68,0.18)",
                backgroundColor: "rgba(245,241,233,0.88)",
              }}
            >
              Open Instagram
              <HiMiniArrowUpRight className="text-lg" />
            </a>
          </div>
        </div>

        <div className="group/carousel relative z-10 mt-8">
          <div className="mb-4 flex items-center justify-between gap-3 px-4 md:px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
              {usingFallback ? "Curated highlights" : "Live visual stream"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => nudgeTrack(-320)}
            className="absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border bg-white/10 opacity-0 backdrop-blur-md transition-all hover:bg-white/20 group-hover/carousel:opacity-100"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <HiOutlineChevronLeft className="text-2xl text-white" />
          </button>
          <button
            type="button"
            onClick={() => nudgeTrack(320)}
            className="absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border bg-white/10 opacity-0 backdrop-blur-md transition-all hover:bg-white/20 group-hover/carousel:opacity-100"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <HiOutlineChevronRight className="text-2xl text-white" />
          </button>

          <div
            ref={trackRef}
            className="interactive-carousel relative overflow-x-auto pb-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onFocusCapture={() => setIsFocusedWithin(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsFocusedWithin(false);
              }
            }}
            onWheel={handleWheel}
          >
            <div className="flex w-max gap-4 pr-4 sm:gap-5">
              {items.map((item, index) => (
                <a
                  key={`${item.id}-${index}`}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="ultra-3d-hover group relative block w-[14rem] shrink-0 snap-start overflow-hidden rounded-[1.65rem] border sm:w-[17rem] lg:w-[18rem]"
                  style={{
                    borderColor: "rgba(74,101,68,0.12)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.74), rgba(245,241,233,0.78))",
                    boxShadow: "0 18px 40px rgba(74,101,68,0.08)",
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={item.mediaUrl}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 224px, 288px"
                      className="object-cover transition duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(74,101,68,0.76)_100%)]" />
                    <div className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full text-white backdrop-blur-md" style={{ backgroundColor: "rgba(164,108,43,0.88)" }}>
                      <FaInstagram />
                    </div>
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="max-h-16 overflow-hidden text-sm leading-5 text-white/90">{item.caption}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
