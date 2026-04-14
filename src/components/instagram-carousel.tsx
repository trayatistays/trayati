"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa6";
import { HiMiniArrowUpRight } from "react-icons/hi2";
import type { InstagramMediaItem } from "@/lib/instagram";
import { socialLinks } from "@/data/social-links";

export function InstagramCarousel() {
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
    } catch {}
    return [];
  });
  const [usingFallback, setUsingFallback] = useState(true);

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
        } catch {}
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [items.length]);

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
            <p className="mt-3 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: "var(--foreground-soft)" }}>
              {usingFallback
                ? ""
                : ""}
            </p>
          </div>

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

        <div className="relative z-10 mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div
            className="marquee-track marquee-track--hover-slow flex w-max gap-4"
            style={
              {
                "--marquee-duration": "32s",
                "--marquee-duration-hover": "54s",
              } as CSSProperties
            }
          >
            {items.map((item, index) => (
              <a
                key={`${item.id}-${index}`}
                href={item.permalink}
                target="_blank"
                rel="noreferrer"
                className="ultra-3d-hover group relative block w-[14rem] shrink-0 overflow-hidden rounded-[1.65rem] border sm:w-[17rem] lg:w-[18rem]"
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
                    <p className="max-h-10 overflow-hidden text-sm leading-5 text-white/90">{item.caption}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
