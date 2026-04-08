"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiX } from "react-icons/hi";

type NavbarProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

export function Navbar({ menuOpen, onToggleMenu }: NavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 flex items-center justify-between gap-3 rounded-[1.6rem] border border-black/8 bg-white/58 px-2.5 py-2.5 shadow-[0_20px_50px_rgba(121,131,153,0.1)] backdrop-blur-2xl sm:gap-4 sm:rounded-[2rem] sm:px-4 sm:py-3 lg:px-5"
    >
      <a
        href="#top"
        className="group flex min-w-0 flex-1 items-center gap-2 rounded-full px-1.5 py-1.5 transition duration-300 hover:bg-white/40 sm:gap-3 sm:px-2"
        aria-label="Trayati Stays homepage"
      >
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#d9dbe2] bg-[#faf7f0] shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:size-12">
          <Image
            src="/trayati-logo.jpg"
            alt="Trayati logo"
            fill
            sizes="(max-width: 640px) 40px, 48px"
            className="object-cover"
            priority
          />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-base font-semibold tracking-[-0.03em] text-[#181b24] sm:text-xl">
            Trayati Stays
          </p>
          <p className="truncate text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#7a8090] sm:text-xs sm:tracking-[0.24em]">
            Premium stay discovery
          </p>
        </div>
      </a>

      <div className="flex shrink-0 items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 36px rgba(36,41,56,0.14)" }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-[#181b24] px-3.5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_18px_36px_rgba(24,27,36,0.18)] transition duration-300 hover:bg-[#242938] sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
          aria-label="Book now"
        >
          Book Now
        </motion.button>

        <motion.button
          type="button"
          onClick={onToggleMenu}
          whileHover={{ scale: 1.06, rotate: menuOpen ? 0 : 6 }}
          whileTap={{ scale: 0.96 }}
          className="flex size-11 items-center justify-center rounded-full border border-black/8 bg-white text-[#171b24] shadow-[0_14px_30px_rgba(121,131,153,0.12)] backdrop-blur-xl transition duration-300 hover:border-black/14 sm:size-14"
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
