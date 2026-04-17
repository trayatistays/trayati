"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { AnimatedText } from "@/components/animated-text";
import { Navbar } from "@/components/navbar";
import { ExperienceOverlay } from "@/components/experience-overlay";
import { socialLinks } from "@/data/social-links";

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

export function SiteHeader({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [activeOverlayItem, setActiveOverlayItem] = useState("About");

  const handleMenuClick = (item: string) => {
    const routes: Record<string, string> = {
      About: "/about",
      Blogs: "/blogs",
      Connect: "/contact",
      Solutions: "/solutions",
    };
    setMenuOpen(false);
    setTimeout(() => router.push(routes[item]), 300);
  };

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <Navbar
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onOpenExperience={() => setExperienceOpen(true)}
        forceScrolled={forceScrolled}
      />

      <ExperienceOverlay
        isOpen={experienceOpen}
        onClose={() => setExperienceOpen(false)}
      />

      {/* Full-page menu overlay */}
      <motion.aside
        initial={false}
        animate={
          menuOpen
            ? { opacity: 1, scale: 1, pointerEvents: "auto" }
            : { opacity: 0, scale: 1.02, pointerEvents: "none" }
        }
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[9998] overflow-y-auto"
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Trayati Stays menu"
      >
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(245, 241, 233, 0.97)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,58,82,0.10),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(164,108,43,0.08),transparent_20%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(74,101,68,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(74,101,68,0.06)_1px,transparent_1px)] [background-size:72px_72px] pointer-events-none" />

        <div className="relative flex min-h-full min-w-0 flex-col px-4 pt-28 pb-4 sm:px-8 sm:pt-32 sm:pb-6 lg:px-12 lg:pt-36">
          <div className="flex items-center justify-center pt-2">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.05em] sm:text-4xl" style={{ color: "var(--primary)" }}>
              Trayati Stays
            </h2>
          </div>

          <div className="grid min-w-0 flex-1 items-start gap-8 py-6 md:grid-cols-[0.9fr_auto_1fr] md:items-center md:gap-20 lg:gap-24">
            {/* Preview card */}
            <div className="flex min-w-0 flex-col items-center justify-center gap-6 md:items-end md:gap-8">
              <div
                className="hidden md:block w-full max-w-[320px] overflow-hidden rounded-[1.75rem] border p-3 shadow-[0_24px_60px_rgba(74,101,68,0.14)] backdrop-blur-xl"
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
            <div className="flex min-w-0 flex-col justify-center md:pl-2">
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
    </>
  );
}
