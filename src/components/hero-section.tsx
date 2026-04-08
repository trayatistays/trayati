"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { AnimatedText } from "@/components/animated-text";
import { GlobeShowcase } from "@/components/globe-showcase";
import { Navbar } from "@/components/navbar";

const keywords = ["Effortless", "Smart", "Personalised"];
const destinations = ["Goa", "Jaipur", "Manali", "Udaipur", "Coorg"];
const menuItems = ["About", "Blogs", "Connect", "Solutions"];
const socials = [
  { label: "WhatsApp", href: "#", icon: FaWhatsapp },
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "Facebook", href: "#", icon: FaFacebookF },
];
const overlayImages: Record<string, { src: string; title: string; subtitle: string }> = {
  About: {
    src: "/menu-about.jpg",
    title: "About Trayati Stays",
    subtitle: "Mountain panoramas and an intentional stay experience.",
  },
  Blogs: {
    src: "/menu-blogs.jpg",
    title: "Blogs and Stories",
    subtitle: "Property stories, destination ideas, and travel inspiration.",
  },
  Connect: {
    src: "/menu-connect.jpg",
    title: "Connect With Us",
    subtitle: "Conversations shaped around views, warmth, and hospitality.",
  },
  Solutions: {
    src: "/menu-solutions.jpg",
    title: "Tailored Solutions",
    subtitle: "A smarter way to present and discover memorable stays.",
  },
};

export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeOverlayItem, setActiveOverlayItem] = useState("About");
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 110, damping: 18, mass: 0.8 });
  const smoothY = useSpring(mouseY, { stiffness: 110, damping: 18, mass: 0.8 });
  const orbX = useSpring(mouseX, { stiffness: 90, damping: 20, mass: 1 });
  const orbY = useSpring(mouseY, { stiffness: 90, damping: 20, mass: 1 });
  const heroTransform = useMotionTemplate`translate3d(${smoothX}px, ${smoothY}px, 0px)`;
  const orbTransform = useMotionTemplate`translate3d(${orbX}px, ${orbY}px, 0px)`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left - rect.width / 2) / 36;
    const y = (clientY - rect.top - rect.height / 2) / 40;

    mouseX.set(x);
    mouseY.set(y);
  };

  const resetMouse = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="top"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      className="relative isolate min-h-screen overflow-hidden"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(188,222,255,0.95),transparent_34%),linear-gradient(180deg,#fffdf7_0%,#f6f4ef_52%,#f1efe9_100%)]" />
      <motion.div
        style={{ transform: orbTransform }}
        className="absolute left-[8%] top-24 -z-10 size-56 rounded-full bg-[#a78bfa]/16 blur-3xl"
      />
      <motion.div
        style={{ transform: orbTransform }}
        className="absolute bottom-20 right-[8%] -z-10 size-72 rounded-full bg-[#9ed7da]/16 blur-3xl"
      />

      <div className="flex min-h-screen w-full flex-col px-4 pb-8 pt-5 sm:px-6 lg:px-10">
        <Navbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((value) => !value)} />

        <div className="relative mt-8 flex flex-1 items-center">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: menuOpen ? 0.18 : 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              style={{ transform: heroTransform }}
              className="relative flex flex-col justify-center py-10 lg:px-4 lg:py-16 xl:pl-8"
            >
              <div className="gradient-stroke inline-flex w-fit items-center gap-3 rounded-full bg-white/72 px-4 py-2 text-sm text-[#4e5567] shadow-[0_18px_40px_rgba(121,131,153,0.12)] backdrop-blur-2xl">
                <span className="size-2 rounded-full bg-[#65c0a5] shadow-[0_0_18px_rgba(101,192,165,0.55)]" />
                Premium OTA for curated stays
              </div>

              <h1 className="text-balance mt-8 max-w-4xl font-display text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#181b24] sm:text-[4rem] lg:text-[5.05rem]">
                we make discovering and booking stays
              </h1>

              <div className="mt-5 flex min-h-[5.9rem] items-center font-display text-[2.9rem] font-semibold leading-none tracking-[-0.06em] sm:min-h-[6.8rem] sm:text-[4.2rem] lg:text-[5.55rem]">
                <AnimatedText
                  items={keywords}
                  className="hero-word-shadow text-[#f3b16d]"
                />
              </div>

              <p className="text-balance mt-6 max-w-2xl text-lg leading-8 text-[#5e6678]">
                Whether you&apos;re planning a quick getaway, a business trip, or a
                long vacation, Trayati Stays connects you with the best
                properties at the best prices, all in one place.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <motion.a
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="#properties"
                  className="rounded-full bg-[#181b24] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_rgba(24,27,36,0.18)]"
                  style={{ color: "#ffffff" }}
                >
                  Explore Properties
                </motion.a>
                <div className="gradient-stroke rounded-full bg-white/70 px-4 py-3 text-sm text-[#5f6876] backdrop-blur-xl">
                  Smart search, local stays, seamless booking
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 54 }}
              animate={{ opacity: menuOpen ? 0.12 : 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              className="relative"
            >
              <GlobeShowcase />
            </motion.div>
          </div>

          <motion.aside
            initial={false}
            animate={
              menuOpen
                ? { opacity: 1, scale: 1, pointerEvents: "auto" }
                : { opacity: 0, scale: 1.02, pointerEvents: "none" }
            }
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-40 overflow-hidden rounded-[2rem]"
            aria-hidden={!menuOpen}
          >
            <div className="absolute inset-0 bg-[rgba(248,247,244,0.96)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(172,213,255,0.24),transparent_26%)]" />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(20,20,20,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

            <div className="relative flex h-full flex-col px-6 py-6 text-[#171717] sm:px-8 lg:px-12">
              <div className="flex items-center justify-center pt-2">
                <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[#202020] sm:text-4xl">
                  Trayati Stays
                </h2>
              </div>

              <div className="grid flex-1 items-center gap-12 py-8 md:grid-cols-[0.9fr_auto_1fr] md:gap-20 lg:gap-24">
                <div className="flex flex-col items-center justify-center gap-8 md:items-end">
                  <div className="w-full max-w-[320px] overflow-hidden rounded-[2rem] border border-black/8 bg-white/70 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,#dbeafe,#ede9fe_46%,#ffffff_100%)]">
                      <motion.div
                        key={activeOverlayItem}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={overlayImages[activeOverlayItem].src}
                          alt={overlayImages[activeOverlayItem].title}
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,18,28,0.02),rgba(14,18,28,0.14)_45%,rgba(14,18,28,0.56)_100%)]" />
                      <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/20 bg-white/60 p-4 backdrop-blur-md">
                        <p className="text-xs uppercase tracking-[0.28em] text-black/45">
                          {activeOverlayItem}
                        </p>
                        <p className="mt-2 font-display text-2xl text-black">
                          {overlayImages[activeOverlayItem].title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-black/60">
                          {overlayImages[activeOverlayItem].subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {socials.map(({ label, href, icon: Icon }) => (
                      <motion.a
                        key={label}
                        href={href}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-base text-[#181b24] shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition duration-300 hover:border-[#a78bfa] hover:bg-[#a78bfa] hover:text-white"
                        aria-label={label}
                      >
                        <Icon />
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="hidden h-full min-h-52 w-px bg-black/14 md:block" />

                <div className="flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-[0.34em] text-black/38">
                    Transition section
                  </p>
                  <div className="mt-3 text-2xl font-medium text-[#5b42c2] sm:text-3xl">
                    <AnimatedText items={destinations} interval={1800} />
                  </div>

                  <nav aria-label="Trayati Stays menu" className="mt-8">
                    <ul className="space-y-5">
                      {menuItems.map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: 12 }}
                          animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                          transition={{ delay: 0.12 + index * 0.08, duration: 0.35 }}
                        >
                          <a
                            href="#"
                            onMouseEnter={() => setActiveOverlayItem(item)}
                            onFocus={() => setActiveOverlayItem(item)}
                            className="group flex items-center justify-between rounded-full border border-transparent py-1 text-3xl capitalize tracking-[-0.05em] text-black/84 transition duration-300 hover:text-black sm:text-5xl"
                          >
                            <span>{item}</span>
                            <span className="relative ml-6 flex size-14 items-center justify-center">
                              <span className="absolute inset-3 rounded-full border border-[#a78bfa]/25 bg-[#a78bfa]/10 opacity-0 transition duration-300 group-hover:inset-0 group-hover:opacity-100 group-hover:shadow-[0_0_24px_rgba(167,139,250,0.35)]" />
                              <span className="relative size-2 rounded-full bg-black/60 transition duration-300 group-hover:size-3 group-hover:bg-[#5b42c2]" />
                            </span>
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.65 }}
          className="mt-8 flex items-center justify-between gap-4 border-t border-black/8 pt-4 text-xs uppercase tracking-[0.28em] text-[#697080]"
        >
          <span>Built for premium stays</span>
          <span>Fast discovery • smart booking • personalised journeys</span>
        </motion.div>
      </div>

      {!mounted ? null : (
        <div className="sr-only" aria-live="polite">
          Current highlight rotates between effortless, smart, and personalised.
        </div>
      )}
    </section>
  );
}
