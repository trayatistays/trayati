"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useState } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { AnimatedText } from "@/components/animated-text";
import { Navbar } from "@/components/navbar";
import { ExperienceOverlay } from "@/components/experience-overlay";
import { socialLinks } from "@/data/social-links";

const keywords = ["Folklore Homestays", "Apartments & Condos", "Villas"];
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
export function HeroSection() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [activeOverlayItem, setActiveOverlayItem] = useState("About");
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 110, damping: 18, mass: 0.8 });
  const smoothY = useSpring(mouseY, { stiffness: 110, damping: 18, mass: 0.8 });
  const orbX = useSpring(mouseX, { stiffness: 90, damping: 20, mass: 1 });
  const orbY = useSpring(mouseY, { stiffness: 90, damping: 20, mass: 1 });
  const heroTransform = useMotionTemplate`translate3d(${smoothX}px, ${smoothY}px, 0px)`;
  const orbTransform = useMotionTemplate`translate3d(${orbX}px, ${orbY}px, 0px)`;

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

  const handleMenuClick = (item: string) => {
    const routes: Record<string, string> = {
      About: "/about",
      Blogs: "/blogs",
      Connect: "/connect",
      Solutions: "/solutions",
    };
    setMenuOpen(false);
    setTimeout(() => router.push(routes[item]), 300);
  };

  return (
    <section
      id="top"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      className="relative isolate min-h-[85vh] overflow-hidden"
    >
      {/* Subtle colour-tinted halos that sit on top of the tribal pattern */}
      <motion.div
        style={{ transform: orbTransform, backgroundColor: "rgba(164, 108, 43, 0.14)" }}
        className="absolute left-[8%] top-16 -z-10 size-40 rounded-full blur-3xl sm:top-24 sm:size-56 pointer-events-none"
      />
      <motion.div
        style={{ transform: orbTransform, backgroundColor: "rgba(13, 58, 82, 0.14)" }}
        className="absolute bottom-12 right-[8%] -z-10 size-52 rounded-full blur-3xl sm:bottom-20 sm:size-72 pointer-events-none"
      />



      <div className="flex min-h-[85vh] w-full flex-col px-4 pb-0 pt-4 sm:px-6 sm:pt-5 lg:px-10">
        <Navbar
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          onOpenExperience={() => setExperienceOpen(true)}
        />

        <ExperienceOverlay
          isOpen={experienceOpen}
          onClose={() => setExperienceOpen(false)}
        />

        <div className="relative mt-6 flex flex-1 items-start lg:mt-8 lg:items-center">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: menuOpen ? 0.15 : 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              style={{ transform: heroTransform }}
              className="relative flex max-w-[980px] flex-col justify-center py-3 sm:py-8 lg:px-4 lg:py-16 xl:max-w-[1100px] xl:pl-8"
            >
              <h1
                className="text-balance mt-6 max-w-4xl font-display 
             text-[1.8rem] 
             sm:text-[2.4rem] 
             md:text-[3rem] 
             lg:text-[3.8rem] 
             xl:text-[4.5rem] 
             font-semibold leading-[1.1] tracking-[-0.02em]"
                style={{ color: "var(--primary)" }}
              >
                Where Every Stay Becomes a Story
              </h1>

              <div className="mt-4 flex min-h-[5.4rem] w-full max-w-full items-center font-display text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.06em] sm:mt-5 sm:min-h-[6.8rem] sm:text-[4.2rem] sm:leading-none lg:text-[5.7rem] xl:text-[6.15rem]">
                <AnimatedText items={keywords} className="hero-word-shadow text-[var(--gold)]" />
              </div>

              <p
                className="text-balance mt-5 max-w-3xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 lg:text-[1.12rem]"
                style={{ color: "var(--foreground-soft)" }}
              >
                We specialise in locally curated, authentic and heritage stays to personify your holiday with our sprinkled charm. Our experience and studies state that modern travellers crave authenticity over cookie-cutter hotels, yet finding verified stays scattered across OTAs feels impossible. Trayati Stays bridges that gap by listing only handpicked properties.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="/booking"
                  className="w-full rounded-full bg-[var(--button-primary)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(74,101,68,0.40)] transition hover:scale-105 hover:bg-[var(--button-primary-hover)] active:scale-98 sm:w-auto"
                >
                  Explore Properties
                </Link>
                <Link
                  href="/list-property"
                  className="gradient-stroke w-full rounded-full px-4 py-3 text-sm backdrop-blur-xl sm:w-auto"
                  style={{
                    backgroundColor: "rgba(245, 241, 232, 0.88)",
                    color: "var(--foreground-soft)",
                  }}
                >
                  List Your Property
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Full-page menu overlay */}
          <motion.aside
            initial={false}
            animate={
              menuOpen
                ? { opacity: 1, scale: 1, pointerEvents: "auto" }
                : { opacity: 0, scale: 1.02, pointerEvents: "none" }
            }
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-40 overflow-y-auto rounded-[2rem]"
            aria-hidden={!menuOpen}
          >
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(245, 241, 233, 0.97)" }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,58,82,0.10),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(164,108,43,0.08),transparent_20%)]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(74,101,68,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(74,101,68,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

            <div className="relative flex min-h-full flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
              <div className="flex items-center justify-center pt-2">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.05em] sm:text-4xl" style={{ color: "var(--primary)" }}>
                  Trayati Stays
                </h2>
              </div>

              <div className="grid flex-1 items-start gap-8 py-6 md:grid-cols-[0.9fr_auto_1fr] md:items-center md:gap-20 lg:gap-24">
                {/* Preview card */}
                <div className="flex flex-col items-center justify-center gap-6 md:items-end md:gap-8">
                  <div
                    className="w-full max-w-[320px] overflow-hidden rounded-[1.75rem] border p-3 shadow-[0_24px_60px_rgba(74,101,68,0.14)] backdrop-blur-xl"
                    style={{
                      borderColor: "var(--border-soft)",
                      backgroundColor: "rgba(245, 241, 233, 0.92)",
                    }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]" style={{ backgroundColor: "rgba(220, 215, 200, 1)" }}>
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
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(74,101,68,0.55)_100%)]" />
                      <div
                        className="absolute inset-x-4 bottom-4 rounded-[1.25rem] border p-3 backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-4"
                        style={{
                          borderColor: "var(--border-soft)",
                          backgroundColor: "rgba(245, 241, 233, 0.90)",
                        }}
                      >
                        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--muted)" }}>
                          {activeOverlayItem}
                        </p>
                        <p className="mt-2 font-display text-xl" style={{ color: "var(--primary)" }}>
                          {overlayImages[activeOverlayItem].title}
                        </p>
                        <p className="mt-2 text-sm leading-6" style={{ color: "var(--foreground-soft)" }}>
                          {overlayImages[activeOverlayItem].subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Socials */}
                  <div className="flex items-center gap-3 self-start md:self-auto">
                    {socials.map(({ label, href, icon: Icon }) => (
                      <motion.a
                        key={label}
                        href={href}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex size-11 items-center justify-center rounded-full border text-base shadow-[0_8px_20px_rgba(74,101,68,0.12)] transition duration-300"
                        style={{
                          borderColor: "var(--border-soft)",
                          backgroundColor: "rgba(240, 236, 226, 0.96)",
                          color: "var(--primary)",
                        }}
                        aria-label={label}
                      >
                        <Icon />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden h-full min-h-52 w-px md:block" style={{ backgroundColor: "var(--border-soft)" }} />

                {/* Nav links */}
                <div className="flex flex-col justify-center md:pl-2">
                  <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "var(--muted)" }}>
                    Explore section
                  </p>
                  <div className="mt-3 text-2xl font-medium sm:text-3xl" style={{ color: "var(--gold)" }}>
                    <AnimatedText items={destinations} interval={1800} />
                  </div>

                  {/* Menu items */}
                  <nav aria-label="Trayati Stays menu" className="mt-6 sm:mt-8">
                    <ul className="space-y-3 sm:space-y-5">
                      {menuItems.map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: 12 }}
                          animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                          transition={{ delay: 0.12 + index * 0.08, duration: 0.35 }}
                        >
                          <motion.button
                            onMouseEnter={() => setActiveOverlayItem(item)}
                            onFocus={() => setActiveOverlayItem(item)}
                            onClick={() => handleMenuClick(item)}
                            whileHover={{
                              borderColor: "var(--border-soft)",
                              backgroundColor: "rgba(74, 101, 68, 0.06)",
                              color: "var(--cta)",
                            }}
                            className="group w-full flex items-center justify-between rounded-full border px-4 py-3 text-2xl capitalize tracking-[-0.05em] transition duration-300 bg-transparent sm:border-transparent sm:bg-transparent sm:px-0 sm:py-1 sm:text-5xl"
                            style={{
                              borderColor: "var(--border-soft)",
                              color: "var(--primary)",
                            }}
                          >
                            <span>{item}</span>
                            <span className="relative ml-4 flex size-12 items-center justify-center sm:ml-6 sm:size-14">
                              <span
                                className="absolute inset-3 rounded-full border opacity-0 transition duration-300 group-hover:inset-0 group-hover:opacity-100"
                                style={{
                                  borderColor: "rgba(164, 108, 43, 0.4)",
                                  backgroundColor: "rgba(164, 108, 43, 0.14)",
                                }}
                              />
                              <span
                                className="relative size-2 rounded-full transition duration-300 group-hover:size-3"
                                style={{ backgroundColor: "var(--gold)" }}
                              />
                            </span>
                          </motion.button>
                        </motion.li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
