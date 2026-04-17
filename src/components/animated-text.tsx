"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type AnimatedTextProps = {
  items: string[];
  className?: string;
  interval?: number;
};

export function AnimatedText({
  items,
  className,
  interval = 2200,
}: AnimatedTextProps) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [interval, items.length]);

  if (isMobile) {
    return (
      <span className={`inline-block max-w-full ${className ?? ""}`}>
        <AnimatePresence mode="wait">
          <motion.span
            key={items[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block max-w-full whitespace-normal text-balance sm:whitespace-nowrap"
          >
            {items[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  return (
    <span className={`inline-block max-w-full ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={items[index]}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block max-w-full whitespace-normal text-balance sm:whitespace-nowrap"
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
