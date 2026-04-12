"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRightLong, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { HiMiniArrowUpRight } from "react-icons/hi2";
import { socialLinks } from "@/data/social-links";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Booking" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Blogs" },
  { href: "/solutions", label: "Solutions" },
  { href: "/connect", label: "Connect" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 w-full overflow-hidden px-0 pb-0">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative mt-6 overflow-hidden border-t border-b px-5 py-8 sm:px-8 sm:py-10 lg:px-10"
          style={{
            borderColor: "rgba(32,60,76,0.12)",
            background:
              "linear-gradient(140deg, rgba(20,37,46,0.97), rgba(32,60,76,0.92) 42%, rgba(52,85,67,0.95) 100%)",
            boxShadow: "0 30px 90px rgba(18,28,38,0.20)",
          }}
        >

          <div className="absolute -left-20 top-0 size-64 rounded-full bg-[rgba(199,91,26,0.18)] blur-3xl" />
          <div className="absolute bottom-0 right-0 size-72 rounded-full bg-[rgba(95,168,168,0.16)] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(8,17,24,0.28))]" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">Trayati Stays</p>
              <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Stays with character, stories, and a more alive sense of place.
              </h2>
              <p className="mt-4 max-w-xl rounded-[1.5rem] border px-4 py-4 text-sm leading-7 text-white/88 backdrop-blur-sm sm:text-base" style={{ borderColor: "rgba(245,241,232,0.1)", backgroundColor: "rgba(245,241,232,0.06)" }}>
                Explore curated villas, heritage homes, mountain retreats, and soulful escapes across India .
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="ultra-3d-hover inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                  style={{ backgroundColor: "var(--cta)" }}
                >
                  Book a Stay
                  <FaArrowRightLong />
                </Link>
                <Link
                  href="/contact"
                  className="ultra-3d-hover inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md"
                  style={{ borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  Talk to Us
                </Link>
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">Everything</p>
                <nav aria-label="Footer navigation" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-1">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="ultra-3d-hover group inline-flex items-center justify-between rounded-2xl border px-4 py-3 text-sm text-white backdrop-blur-md"
                      style={{
                        borderColor: "rgba(255,255,255,0.15)",
                        backgroundColor: "rgba(241, 235, 235, 1)",
                      }}
                    >
                      {link.label}
                      <HiMiniArrowUpRight className="text-base opacity-60 transition duration-300 group-hover:opacity-100" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">Contact</p>
                <div className="mt-4 space-y-3 text-sm text-white/88">
                  <a href={`mailto:${socialLinks.email}`} className="ultra-3d-hover block rounded-2xl border px-4 py-3 text-white backdrop-blur-md" style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)" }}>
                    {socialLinks.email}
                  </a>
                  <a href={`tel:${socialLinks.phone.replace(/\s+/g, "")}`} className="ultra-3d-hover block rounded-2xl border px-4 py-3 text-white backdrop-blur-md" style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)" }}>
                    {socialLinks.phone}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">Social</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    { href: socialLinks.instagram.url, label: "Instagram", icon: FaInstagram },
                    { href: socialLinks.facebook.url, label: "Facebook", icon: FaFacebookF },
                    { href: socialLinks.whatsapp.url, label: "WhatsApp", icon: FaWhatsapp },
                  ].map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="ultra-3d-hover flex size-12 items-center justify-center rounded-full border text-white backdrop-blur-md"
                      style={{
                        borderColor: "rgba(255,255,255,0.2)",
                        backgroundColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 flex flex-col gap-3 border-t pt-5 text-xs uppercase tracking-[0.22em] text-white/72 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "rgba(245,241,232,0.12)" }}>
            <p className="rounded-full border px-4 py-2 backdrop-blur-sm" style={{ borderColor: "rgba(245,241,232,0.10)", backgroundColor: "rgba(245,241,232,0.07)" }}>Copyright {year} Trayati Stays</p>
            <p className="rounded-full border px-4 py-2 backdrop-blur-sm" style={{ borderColor: "rgba(245,241,232,0.10)", backgroundColor: "rgba(245,241,232,0.07)" }}>Elevate the Way You Stay</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
