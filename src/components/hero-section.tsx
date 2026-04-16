"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState, useSyncExternalStore } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { AnimatedText } from "@/components/animated-text";
import { socialLinks } from "@/data/social-links";

const keywords = ["Folklore Homestays", "Villas and Estates", "Apartments"];
const destinations = ["Kasar Devi", "Dharamsala", "Jaisalmer", "Varkala"];
const menuItems = ["About", "Blogs", "Connect", "Solutions"];
const socials = [
  { label: "WhatsApp", href: socialLinks.whatsapp.url, icon: FaWhatsapp },
  { label: "Instagram", href: socialLinks.instagram.url, icon: FaInstagram },
  { label: "Facebook", href: socialLinks.facebook.url, icon: FaFacebookF },
];
const overlayImages: Record<string, { src: string; title: string; subtitle: string }> = {
  About: {
    src: "/menu-about.webp",
    title: "About Trayati Stays",
    subtitle: "Mountain panoramas and an intentional stay experience.",
  },
  Blogs: {
    src: "/menu-blogs.webp",
    title: "Blogs and Stories",
    subtitle: "Property stories, destination ideas, and travel inspiration.",
  },
  Connect: {
    src: "/menu-connect.webp",
    title: "Connect With Us",
    subtitle: "Conversations shaped around views, warmth, and hospitality.",
  },
  Solutions: {
    src: "/menu-solutions.webp",
    title: "Tailored Solutions",
    subtitle: "A smarter way to present and discover memorable stays.",
  },
};

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia("(min-width: 768px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function getServerSnapshot() {
  return false;
}

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 110, damping: 18, mass: 0.8 });
  const smoothY = useSpring(mouseY, { stiffness: 110, damping: 18, mass: 0.8 });
  const orbX = useSpring(mouseX, { stiffness: 90, damping: 20, mass: 1 });
  const orbY = useSpring(mouseY, { stiffness: 90, damping: 20, mass: 1 });
  const heroTransform = useMotionTemplate`translate3d(${smoothX}px, ${smoothY}px, 0px)`;
  const orbTransform = useMotionTemplate`translate3d(${orbX}px, ${orbY}px, 0px)`;

  useEffect(() => {
    if (!isDesktop) return;
    const timer = window.setTimeout(() => {
      setShouldLoadVideo(true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isDesktop]);

  useEffect(() => {
    if (!shouldLoadVideo) return;

    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 2) {
      setVideoLoaded(true);
    }

    const handleCanPlay = () => setVideoLoaded(true);
    video.addEventListener("canplay", handleCanPlay);

    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [shouldLoadVideo]);

  const handleMouseMove = isDesktop
    ? (event: React.MouseEvent<HTMLElement>) => {
        const { currentTarget, clientX, clientY } = event;
        const rect = currentTarget.getBoundingClientRect();
        const x = (clientX - rect.left - rect.width / 2) / 36;
        const y = (clientY - rect.top - rect.height / 2) / 40;
        mouseX.set(x);
        mouseY.set(y);
      }
    : undefined;

  const resetMouse = isDesktop
    ? () => {
        mouseX.set(0);
        mouseY.set(0);
      }
    : undefined;

  return (
    <section
      id="top"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      className="relative isolate min-h-[85vh] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="https://lintxbjljzaubwuqhwdf.supabase.co/storage/v1/object/public/trayati-media/admin/background.jpg"
          alt=""
          aria-hidden="true"
          fill
          unoptimized
          sizes="100vw"
          className="absolute inset-0 object-cover object-center"
        />
        {isDesktop && shouldLoadVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://lintxbjljzaubwuqhwdf.supabase.co/storage/v1/object/public/trayati-media/admin/background.jpg"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.55)_100%)] md:hidden" />
      </div>

      {/* Subtle colour-tinted halos - desktop only */}
      {isDesktop && (
        <>
          <motion.div
            style={{ transform: orbTransform, backgroundColor: "rgba(164, 108, 43, 0.14)" }}
            className="absolute left-[8%] top-16 -z-10 size-40 rounded-full blur-3xl sm:top-24 sm:size-56 pointer-events-none"
          />
          <motion.div
            style={{ transform: orbTransform, backgroundColor: "rgba(13, 58, 82, 0.14)" }}
            className="absolute bottom-12 right-[8%] -z-10 size-52 rounded-full blur-3xl sm:bottom-20 sm:size-72 pointer-events-none"
          />
        </>
      )}

      <div className="flex min-h-[85vh] w-full flex-col px-4 pb-12 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-10 lg:pb-28 lg:pt-36">

        <div className="relative mt-6 flex flex-1 items-start lg:mt-8 lg:items-center">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              style={isDesktop ? { transform: heroTransform } : undefined}
              className="relative flex max-w-[980px] flex-col justify-center py-3 sm:py-8 lg:px-4 lg:py-16 xl:max-w-[1100px] xl:pl-8"
            >
              <h1
                className="mobile-heading text-balance mt-6 max-w-4xl 
             text-[1.65rem] 
             sm:text-[2.25rem] 
             md:text-[2.85rem] 
             lg:text-[3.65rem] 
             xl:text-[4.35rem] 
             font-semibold leading-[1.1] tracking-[-0.02em]"
                style={{ color: "#FFFFFF", fontFamily: "var(--font-playfair)" }}
              >
                we curate
              </h1>

              <div className="mt-4 flex min-h-[5.4rem] w-full max-w-full items-center text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:mt-5 sm:min-h-[6.8rem] sm:text-[4.2rem] sm:leading-none lg:text-[5.7rem] xl:text-[6.15rem]" style={{ fontFamily: '"Trajan Pro 3 Semibold", "Trajan Pro 3", serif', fontWeight: 600 }}>
                <AnimatedText items={keywords} className="hero-word-shadow text-[var(--gold)]" />
              </div>

              <p
                className="mobile-body-text text-balance mt-5 max-w-3xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 lg:text-[1.12rem]"
                style={{ color: "#FFFFFF" }}
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
