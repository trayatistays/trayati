"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineUserCircle, HiX } from "react-icons/hi";

type NavbarProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenExperience?: () => void;
};

export function Navbar({ menuOpen, onToggleMenu, onOpenExperience }: NavbarProps) {
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileLinksOpen, setMobileLinksOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuToggle = () => {
    setMobileLinksOpen(false);
    onToggleMenu();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
    >
      <div className="navbar__inner">
        {/* ── Logo ────────────────────────────────────────────── */}
        <Link
          href="/"
          className="navbar__logo"
          aria-label="Trayati Stays homepage"
        >
          <div className={`navbar__logo-icon ${scrolled ? "navbar__logo-icon--scrolled" : ""}`}>
            <Image
              src="/Logo_transparent.png"
              alt="Trayati Stays logo"
              fill
              sizes="(max-width: 640px) 56px, (max-width: 1024px) 72px, 80px"
              className="object-contain"
              loading="eager"
            />
          </div>
          <div className="navbar__logo-text">
            <p className="navbar__logo-name">Trayati Stays</p>
            <p className="navbar__logo-tagline">Find Your Rhythm</p>
          </div>
        </Link>

        {/* ── Desktop links (md+) ──────────────────────────── */}
        <nav className="navbar__links" aria-label="Main navigation">
          {onOpenExperience && (
            <button
              type="button"
              onClick={onOpenExperience}
              className="navbar__link"
            >
              Live India&apos;s Soul
            </button>
          )}
          <Link href="/booking" className="navbar__link">
            Book Now
          </Link>
          {isSignedIn ? (
            <Link href="/list-property" className="navbar__link">
              List With Us
            </Link>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/list-property">
              <button type="button" className="navbar__link">
                List With Us
              </button>
            </SignInButton>
          )}
        </nav>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="navbar__actions">
          {/* User button — hidden below sm */}
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "size-9 sm:size-10",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="navbar__user-btn"
                aria-label="Sign in"
              >
                <HiOutlineUserCircle className="text-[1.35rem] sm:text-[1.5rem]" />
              </button>
            </SignInButton>
          )}

          {/* Mobile quick-links toggle — visible below md */}
          <button
            type="button"
            onClick={() => setMobileLinksOpen((v) => !v)}
            className="navbar__quicklinks-btn sm:hidden"
            aria-label={mobileLinksOpen ? "Close quick links" : "Open quick links"}
            aria-expanded={mobileLinksOpen}
          >
            {mobileLinksOpen ? (
              <HiX className="text-[1.1rem]" />
            ) : (
              <span className="navbar__quicklinks-label">Explore</span>
            )}
          </button>

          {/* Hamburger — always visible */}
          <motion.button
            type="button"
            onClick={handleMenuToggle}
            whileHover={{ scale: 1.06, rotate: menuOpen ? 0 : 6 }}
            whileTap={{ scale: 0.96 }}
            className="navbar__menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <HiX className="text-[1.3rem]" />
            ) : (
              <span className="flex flex-col gap-[0.22rem]">
                <span className="block h-[2px] w-5 rounded-full bg-current" />
                <span className="ml-auto block h-[2px] w-3 rounded-full bg-current" />
                <span className="block h-[2px] w-5 rounded-full bg-current" />
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Mobile quick-links dropdown (below md) ──────────── */}
      <AnimatePresence>
        {mobileLinksOpen && (
          <motion.div
            key="mobile-links"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="navbar__mobile-links sm:hidden"
          >
            <div className="navbar__mobile-links-inner">
              {onOpenExperience && (
                <button
                  type="button"
                  onClick={() => { onOpenExperience(); setMobileLinksOpen(false); }}
                  className="navbar__mobile-link"
                >
                  Live India&apos;s Soul
                </button>
              )}
              <Link
                href="/booking"
                className="navbar__mobile-link"
                onClick={() => setMobileLinksOpen(false)}
              >
                Book Now
              </Link>
              {isSignedIn ? (
                <Link
                  href="/list-property"
                  className="navbar__mobile-link"
                  onClick={() => setMobileLinksOpen(false)}
                >
                  List With Us
                </Link>
              ) : (
                <SignInButton mode="modal" fallbackRedirectUrl="/list-property">
                  <button
                    type="button"
                    className="navbar__mobile-link"
                    onClick={() => setMobileLinksOpen(false)}
                  >
                    List With Us
                  </button>
                </SignInButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
