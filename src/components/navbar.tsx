"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { HiOutlineUserCircle, HiX } from "react-icons/hi";

type NavbarProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

export function Navbar({ menuOpen, onToggleMenu }: NavbarProps) {
  const { isSignedIn } = useUser();
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 flex items-center justify-between gap-3 rounded-[1.6rem] border px-2.5 py-2.5 shadow-[0_20px_50px_rgba(32,60,76,0.12)] backdrop-blur-2xl sm:gap-4 sm:rounded-[2rem] sm:px-4 sm:py-3 lg:px-5"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: "rgba(245, 241, 232, 0.88)",
      }}
    >
      <a
        href="#top"
        className="group flex min-w-0 flex-1 items-center gap-2 rounded-full px-1.5 py-1.5 transition duration-300 hover:bg-black/5 sm:gap-3 sm:px-2"
        aria-label="Trayati Stays homepage"
      >
        <div
          className="relative size-10 shrink-0 overflow-hidden rounded-full border shadow-[0_8px_20px_rgba(32,60,76,0.14)] sm:size-12"
          style={{
            borderColor: "rgba(164, 106, 45, 0.3)",
            backgroundColor: "rgba(240, 236, 226, 0.98)",
          }}
        >
          <Image
            src="/trayati-logo.jpg"
            alt="Trayati logo"
            fill
            sizes="(max-width: 640px) 60px, 68px"
            className="object-cover"
            priority
          />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-base font-semibold tracking-[-0.03em] sm:text-xl" style={{ color: "var(--primary)" }}>
            Trayati Stays
          </p>
          <p
            className="truncate text-[0.62rem] font-medium uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.24em]"
            style={{ color: "var(--muted)" }}
          >
            Find Your Rhythm
          </p>
        </div>
      </a>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/booking"
            className="inline-flex rounded-full px-3.5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_36px_rgba(199,91,26,0.38)] transition duration-300 sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
            style={{ backgroundColor: "var(--cta)" }}
          >
            Book Now
          </Link>
        </motion.div>

        {isSignedIn ? (
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/list-property"
              className="inline-flex rounded-full border px-3.5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] shadow-[0_16px_36px_rgba(32,60,76,0.12)] transition duration-300 sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
              style={{
                borderColor: "var(--cta)",
                color: "var(--cta)",
                backgroundColor: "rgba(245,241,232,0.88)",
              }}
            >
              List With Us
            </Link>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <SignInButton mode="modal" fallbackRedirectUrl="/list-property">
              <button
                type="button"
                className="inline-flex rounded-full border px-3.5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] shadow-[0_16px_36px_rgba(32,60,76,0.12)] transition duration-300 sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
                style={{
                  borderColor: "var(--cta)",
                  color: "var(--cta)",
                  backgroundColor: "rgba(245,241,232,0.88)",
                }}
              >
                List With Us
              </button>
            </SignInButton>
          </motion.div>
        )}

        {isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-10 sm:size-11",
              },
            }}
          />
        ) : (
          <SignInButton mode="modal">
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(32,60,76,0.12)] backdrop-blur-xl transition duration-300 sm:size-12"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--primary)",
                backgroundColor: "rgba(240, 236, 226, 0.95)",
              }}
              aria-label="Sign in"
            >
              <HiOutlineUserCircle className="text-[1.5rem] sm:text-[1.7rem]" />
            </button>
          </SignInButton>
        )}

        <motion.button
          type="button"
          onClick={onToggleMenu}
          whileHover={{ scale: 1.06, rotate: menuOpen ? 0 : 6 }}
          whileTap={{ scale: 0.96 }}
          className="flex size-11 items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(32,60,76,0.14)] backdrop-blur-xl transition duration-300 sm:size-14"
          style={{
            borderColor: "var(--border-soft)",
            color: "var(--primary)",
            backgroundColor: "rgba(240, 236, 226, 0.95)",
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <HiX className="text-[1.35rem]" />
          ) : (
            <span className="flex flex-col gap-[0.22rem]">
              <span className="block h-[2px] w-5 rounded-full bg-current" />
              <span className="ml-auto block h-[2px] w-3 rounded-full bg-current" />
              <span className="block h-[2px] w-5 rounded-full bg-current" />
            </span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
