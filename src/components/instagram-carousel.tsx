"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa6";
import { HiMiniArrowUpRight } from "react-icons/hi2";
import type { InstagramMediaItem } from "@/lib/instagram";
import { socialLinks } from "@/data/social-links";

const fallbackItems: InstagramMediaItem[] = [
  {
    id: "trayati-instagram-fallback-1",
    mediaUrl: "/samar-villa.png",
    permalink: socialLinks.instagram.url,
    caption: "Samar Villa in the Kumaon hills",
    alt: "Samar Villa with mountain views",
  },
  {
    id: "trayati-instagram-fallback-2",
    mediaUrl: "/property-exterior.jpg",
    permalink: socialLinks.instagram.url,
    caption: "Exterior details from a Trayati stay",
    alt: "Exterior of a Trayati stay",
  },
  {
    id: "trayati-instagram-fallback-3",
    mediaUrl: "/property-view.jpg",
    permalink: socialLinks.instagram.url,
    caption: "View from a curated Trayati property",
    alt: "Scenic view from a Trayati property",
  },
  {
    id: "trayati-instagram-fallback-4",
    mediaUrl: "/property-bedroom.jpg",
    permalink: socialLinks.instagram.url,
    caption: "A restful bedroom at a Trayati stay",
    alt: "Bedroom inside a Trayati property",
  },
];

export function InstagramCarousel() {
  const [items, setItems] = useState<InstagramMediaItem[]>([...fallbackItems, ...fallbackItems]);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    let active = true;

    void fetch("/api/instagram-feed", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { items?: InstagramMediaItem[]; usingFallback?: boolean } | null) => {
        if (!active || !payload?.items?.length) {
          return;
        }

        setItems([...payload.items, ...payload.items]);
        setUsingFallback(Boolean(payload.usingFallback));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative w-full px-0 py-16 sm:py-24">
      <div className="relative w-full overflow-hidden border-y px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,241,232,0.96), rgba(237,233,222,0.94) 48%, rgba(200,221,230,0.72) 100%)",
            boxShadow: "0 30px 90px rgba(18,28,38,0.16)",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/images/tribal-pattern-symbols.jpg')",
            backgroundSize: "220px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,rgba(245,241,232,0.98),transparent)] sm:w-20" />
        <div className="absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,rgba(228,233,228,0.98),transparent)] sm:w-20" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: "var(--gold)" }}>
              Instagram Journal
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl" style={{ color: "var(--primary)" }}>
              The moving visual diary of Trayati
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: "var(--foreground-soft)" }}>
              {usingFallback
                ? "The carousel is ready now and will switch to your live Instagram posts as soon as the access token is added."
                : "Live Instagram posts are flowing here automatically and linking straight back to your profile."}
            </p>
          </div>

          <a
            href={socialLinks.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition duration-300 hover:-translate-y-1"
            style={{
              color: "var(--primary)",
              borderColor: "rgba(32,60,76,0.14)",
              backgroundColor: "rgba(245,241,232,0.82)",
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
                className="group relative block w-[14rem] shrink-0 overflow-hidden rounded-[1.65rem] border sm:w-[17rem] lg:w-[18rem]"
                style={{
                  borderColor: "rgba(32,60,76,0.12)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.74), rgba(245,241,232,0.78))",
                  boxShadow: "0 18px 40px rgba(32,60,76,0.08)",
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={item.mediaUrl}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 224px, 288px"
                    className="object-cover transition duration-700 group-hover:scale-110"
                    unoptimized={item.mediaUrl.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(22,44,56,0.76)_100%)]" />
                  <div className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full text-white backdrop-blur-md" style={{ backgroundColor: "rgba(199,91,26,0.88)" }}>
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
