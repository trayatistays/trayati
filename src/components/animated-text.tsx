"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

type AnimatedTextProps = {
  items: string[];
  className?: string;
  interval?: number;
};

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia("(max-width: 767px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getServerSnapshot() {
  return false;
}

export function AnimatedText({
  items,
  className,
  interval = 2200,
}: AnimatedTextProps) {
  const [index, setIndex] = useState(0);
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, interval);

    return () => window.clearInterval(id);
  }, [interval, items.length]);

  const mobileVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const desktopVariants = {
    initial: { opacity: 0, y: 18, scale: 0.96, filter: "blur(12px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: -18, scale: 1.04, filter: "blur(12px)" },
  };

  return (
    <span className={`inline-block max-w-full ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={items[index]}
          initial={isMobile ? mobileVariants.initial : desktopVariants.initial}
          animate={isMobile ? mobileVariants.animate : desktopVariants.animate}
          exit={isMobile ? mobileVariants.exit : desktopVariants.exit}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block max-w-full whitespace-normal text-balance sm:whitespace-nowrap"
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
