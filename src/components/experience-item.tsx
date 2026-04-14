"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiArrowUpRight } from "react-icons/hi2";

type ExperienceIcon = "homestay" | "apartment" | "villa";

export type ExperienceOverlayItem = {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  bullets: string[];
  icon: ExperienceIcon;
};

type ExperienceItemProps = {
  experience: ExperienceOverlayItem;
  isActive: boolean;
  isDesktop: boolean;
  onActivate: () => void;
  onSelect: () => void;
};

function ExperienceSymbol({
  icon,
}: {
  icon: ExperienceIcon;
}) {
  if (icon === "homestay") {
    return (
      <svg
        viewBox="0 0 80 80"
        className="size-12 sm:size-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M13 39 40 16l27 23" />
        <path d="M20 35v29h40V35" />
        <path d="M32 64V45h16v19" />
        <path d="M27 31h0" />
        <path d="M53 31h0" />
      </svg>
    );
  }

  if (icon === "apartment") {
    return (
      <svg
        viewBox="0 0 80 80"
        className="size-12 sm:size-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="18" y="12" width="20" height="52" rx="2" />
        <rect x="42" y="22" width="20" height="42" rx="2" />
        <path d="M24 22h8M24 31h8M24 40h8M24 49h8" />
        <path d="M48 32h8M48 41h8M48 50h8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 80 80"
      className="size-12 sm:size-14"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 60V34l28-20 28 20v26" />
      <path d="M21 60V29" />
      <path d="M59 60V29" />
      <path d="M31 60V43h18v17" />
      <path d="M28 28h24" />
      <path d="M26 18h28" />
    </svg>
  );
}

export function ExperienceItem({
  experience,
  isActive,
  isDesktop,
  onActivate,
  onSelect,
}: ExperienceItemProps) {
  const active = isDesktop ? true : isActive;

  const handleClick = () => {
    if (isDesktop) {
      onSelect();
      return;
    }

    if (isActive) {
      onSelect();
      return;
    }

    onActivate();
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <hr className="border-t border-[#d9d4cb]" />
      <motion.button
        type="button"
        onClick={handleClick}
        onMouseEnter={isDesktop ? onActivate : undefined}
        whileHover={isDesktop ? { x: 4 } : undefined}
        whileTap={{ scale: 0.995 }}
        className="group grid w-full gap-6 py-8 text-left sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-10"
      >
        <div className="flex min-w-0 items-start gap-4 sm:gap-7">
          <motion.div
            animate={{
              x: [0, 5, 0, -5, 0],
              y: [-5, 0, 5, 0, -5],
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "linear",
            }}
            className="mt-1 shrink-0"
            style={{ color: experience.iconColor }}
          >
            <ExperienceSymbol icon={experience.icon} />
          </motion.div>

          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <h3
                className="font-sans text-[2.15rem] font-medium leading-none tracking-[-0.06em] sm:text-[3.2rem] lg:text-[4.25rem]"
                style={{ color: isActive || isDesktop ? "var(--cta)" : "var(--foreground)" }}
              >
                {experience.title}
              </h3>
              <motion.span
                aria-hidden
                animate={isActive || isDesktop ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -10, y: 8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="hidden rounded-full border p-3 lg:inline-flex"
                style={{
                  borderColor: "rgba(74, 101, 68, 0.14)",
                  color: "var(--primary)",
                }}
              >
                <HiArrowUpRight className="text-xl" />
              </motion.span>
            </div>

            {!isDesktop ? (
              <p
                className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--muted)" }}
              >
                Tap to preview, tap again to book
              </p>
            ) : null}

            <AnimatePresence initial={false}>
              {active ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p
                    className="mt-4 max-w-[32ch] font-serif text-sm leading-relaxed sm:text-base"
                    style={{ color: "var(--foreground-soft)" }}
                  >
                    {experience.description}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden pl-[4rem] sm:pl-[5.25rem] lg:pl-0"
            >
              <ul
                className="space-y-2 text-sm leading-relaxed sm:text-[1rem]"
                style={{ color: "var(--foreground-soft)" }}
              >
                {experience.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
