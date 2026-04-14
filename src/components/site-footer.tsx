"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { socialLinks } from "@/data/social-links";
import { useState } from "react";

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
  const [year] = useState(() => new Date().getFullYear());

  return (
    <footer className="relative w-full mt-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-60px" }}
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--footer-background)" }}
      >
        <div className="pointer-events-none absolute -left-24 -top-16 size-56 rounded-full bg-[rgba(245,241,233,0.06)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 size-60 rounded-full bg-[rgba(164,108,43,0.08)] blur-3xl" />

        <div className="relative z-10 mx-auto flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-10 lg:px-14">
          <Link
            href="/"
            className="footer-link shrink-0 font-display text-base font-bold uppercase tracking-[0.22em]"
          >
            Trayati Stays
          </Link>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-link text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
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
                className="flex size-9 items-center justify-center rounded-full border border-[rgba(245,241,233,0.24)] bg-[rgba(245,241,233,0.08)] text-[var(--footer-foreground)] transition hover:border-[rgba(245,241,233,0.48)] hover:text-[var(--footer-foreground)]"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 flex flex-col gap-1 border-t px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14"
          style={{ borderColor: "rgba(245,241,233,0.22)" }}
        >
          <p
            className="text-[0.65rem] uppercase tracking-[0.22em]"
            style={{ color: "var(--footer-foreground)" }}
          >
            &copy; {year} Trayati Stays &middot; All rights reserved
          </p>
          <p
            className="text-[0.65rem] uppercase tracking-[0.22em]"
            style={{ color: "var(--footer-foreground)" }}
          >
            Elevate the way you stay
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
