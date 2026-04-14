"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { HiOutlineUserCircle, HiX } from "react-icons/hi";

type NavbarProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenExperience?: () => void;
};

export function Navbar({ menuOpen, onToggleMenu, onOpenExperience }: NavbarProps) {
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
    >
      <div className="navbar__inner">
        <Link
          href="/"
          className="navbar__logo"
          aria-label="Trayati Stays homepage"
        >
          <div className="navbar__logo-icon">
            <Image
              src="/trayati-logo.jpg"
              alt="Trayati logo"
              fill
              sizes="(max-width: 640px) 36px, 44px"
              className="object-cover"
              priority
            />
          </div>
          <div className="navbar__logo-text">
            <p className="navbar__logo-name">Trayati Stays</p>
            <p className="navbar__logo-tagline">Find Your Rhythm</p>
          </div>
        </Link>

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

        <div className="navbar__actions">
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

          <motion.button
            type="button"
            onClick={onToggleMenu}
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
    </motion.header>
  );
}
