"use client";

import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi2";

interface LiveIndiaSoulButtonProps {
  onClick: () => void;
}

export function LiveIndiaSoulButton({ onClick }: LiveIndiaSoulButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border px-3.5 py-2.5 transition-all duration-300 sm:w-auto sm:px-5 sm:py-3"
      style={{
        backgroundColor: "rgba(245, 241, 232, 0.82)",
        borderColor: "rgba(164, 106, 45, 0.24)",
        boxShadow: "0 16px 36px rgba(32, 60, 76, 0.08)",
      }}
      aria-label="Open Live India Soul experience selector"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(164,106,45,0.14),transparent_45%,rgba(95,168,168,0.14))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.12, 1.12, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="relative flex size-8 items-center justify-center rounded-full sm:size-9"
        style={{ backgroundColor: "rgba(164, 106, 45, 0.12)" }}
      >
        <HiSparkles className="text-[1rem] sm:text-[1.1rem]" style={{ color: "var(--gold)" }} />
      </motion.div>

      <span
        className="font-display text-[0.56rem] font-bold uppercase tracking-[0.18em] sm:text-[0.72rem]"
        style={{ color: "var(--primary)" }}
      >
        Live India's Soul
      </span>

      <div className="absolute inset-0 -z-10 rounded-full border opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ borderColor: "rgba(164, 106, 45, 0.3)" }} />
    </motion.button>
  );
}
