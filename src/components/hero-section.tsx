"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import { AnimatedText } from "@/components/animated-text";

const keywords = ["Folklore Homestays", "Villas and Estates", "Apartments"];
const MUX_PLAYBACK_ID = process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID || "";
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

export function HeroSection() {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsLargeScreen(e.matches);
    };
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!MUX_PLAYBACK_ID || !isLargeScreen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setShouldLoadVideo(true), 250);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isLargeScreen]);

  const backgroundImageUrl = "https://lintxbjljzaubwuqhwdf.supabase.co/storage/v1/object/public/trayati-media/admin/background.jpg";

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate h-[100svh] min-h-screen overflow-hidden"
    >
      <div className="absolute inset-0 -z-20">
        <Image
          src={backgroundImageUrl}
          alt=""
          aria-hidden="true"
          fill
          preload
          sizes="100vw"
          className="absolute inset-0 object-cover object-center"
        />
        {isLargeScreen && shouldLoadVideo && MUX_PLAYBACK_ID && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <MuxPlayer
              playbackId={MUX_PLAYBACK_ID}
              streamType="on-demand"
              autoPlay="muted"
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={() => setVideoLoaded(true)}
              className="hero-video"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.55)_100%)] md:hidden" />
      </div>

      <div className="flex h-[100svh] min-h-screen w-full flex-col px-4 pb-12 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-10 lg:pb-28 lg:pt-36">
        <div className="relative mt-6 flex flex-1 items-start lg:mt-8 lg:items-center">
          <div className="w-full">
            <div
              className="hero-content-reveal relative flex max-w-[980px] flex-col justify-center py-3 sm:py-8 lg:px-4 lg:py-16 xl:max-w-[1100px] xl:pl-8"
            >
              <h1
                className="mobile-heading text-balance mt-6 max-w-4xl text-[1.65rem] sm:text-[2.25rem] md:text-[2.85rem] lg:text-[3.65rem] xl:text-[4.35rem] font-semibold leading-[1.1] tracking-[-0.02em]"
                style={{ color: "#FFFFFF", fontFamily: "var(--font-playfair)", textShadow: "0 2px 12px rgba(0,0,0,0.45), 0 0 30px rgba(0,0,0,0.25)" }}
              >
                we curate
              </h1>

              <div className="mt-4 flex min-h-[5.4rem] w-full max-w-full items-center text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:mt-5 sm:min-h-[6.8rem] sm:text-[4.2rem] sm:leading-none lg:text-[5.7rem] xl:text-[6.15rem]" style={{ fontFamily: '"Trajan Pro 3 Semibold", "Trajan Pro 3", serif', fontWeight: 600 }}>
                <AnimatedText items={keywords} className="hero-word-shadow text-[#fa902f]" />
              </div>

              <p
                className="mobile-body-text text-balance mt-5 max-w-3xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 lg:text-[1.12rem]"
                style={{ color: "#FFFFFF", textShadow: "0 1px 8px rgba(0,0,0,0.5), 0 0 24px rgba(0,0,0,0.3)" }}
              >
                Our Vision is to reach experimental travellers across all classes, craving authenticity and experience. From Bir&apos;s 100-year-old Mudhouse to Kasar Devi&apos;s luxury villas, we preserve living history and promote authenticity.
              </p>

              <div className="cta-group-gap mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="/booking"
                  className="cta-min-target w-full rounded-full bg-[var(--button-primary)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] shadow-[0_18px_40px_rgba(74,101,68,0.40)] transition hover:scale-105 hover:bg-[var(--button-primary-hover)] active:scale-98 sm:w-auto"
                  style={{ color: "#FFFFFF" }}
                >
                  Explore Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
