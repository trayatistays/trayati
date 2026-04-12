"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import { ExperienceItem, type ExperienceOverlayItem } from "./experience-item";

const experiences: Array<
  ExperienceOverlayItem & {
    routeValue: string;
    image: string;
    imageAlt: string;
  }
> = [
  {
    id: "folklore-homestays",
    title: "Folklore Homestays",
    description:
      "Local hosts, raw culture. Think family-run village homes where you eat farm-fresh meals, hear folk tales by the fire, and learn chai-making from someone who's done it 50 years.",
    routeValue: "Folklore Homestays",
    image: "/property-lounge.jpg",
    imageAlt: "Warm heritage-style homestay lounge with handcrafted character.",
    iconColor: "rgba(196, 212, 120, 0.95)",
    icon: "homestay",
    bullets: [
      "family-run village homes",
      "farm-fresh local meals",
      "fireside folk tales",
      "slow rituals & chai-making",
    ],
  },
  {
    id: "apartments-and-condos",
    title: "Apartments & Condos",
    description:
      "Independent, automated, hassle-free. Smart locks, self check-in, modern comforts in heritage locations. Perfect for digital nomads or families wanting privacy without host interaction but still breathing destination vibes.",
    routeValue: "Apartments & Condos",
    image: "/property-bedroom.jpg",
    imageAlt: "Refined apartment-style stay with clean contemporary interiors.",
    iconColor: "rgba(255, 120, 86, 0.95)",
    icon: "apartment",
    bullets: [
      "smart locks & self check-in",
      "modern comforts in heritage locations",
      "privacy-first stays",
      "ideal for digital nomads & families",
    ],
  },
  {
    id: "villas",
    title: "Villas",
    description:
      "Private luxury escapes. Gated compounds, pools, sprawling lawns-your own palace with staff on call. Heritage havelis turned boutique estates, colonial bungalows with history, modern villas in cultural hotspots.",
    routeValue: "Villas",
    image: "/samar-villa.png",
    imageAlt: "Private villa escape with open grounds and a premium retreat atmosphere.",
    iconColor: "rgba(179, 221, 244, 0.95)",
    icon: "villa",
    bullets: [
      "private compounds & pools",
      "staff on call",
      "heritage havelis & colonial bungalows",
      "large-format luxury escapes",
    ],
  },
];

type ExperienceOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ExperienceOverlay({
  isOpen,
  onClose,
}: ExperienceOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeId, setActiveId] = useState(experiences[0].id);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const activeExperience = useMemo(
    () => experiences.find((item) => item.id === activeId) ?? experiences[0],
    [activeId],
  );

  const handleSelect = (experienceType: string) => {
    onClose();
    router.push(`/booking?experience=${encodeURIComponent(experienceType)}`);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(245,241,232,0.72)] backdrop-blur-md"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-india-soul-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto min-h-screen max-w-[1500px] px-4 py-12 outline-none sm:px-6 lg:px-10"
          >
            <div className="mb-10 flex items-start justify-between gap-6 lg:mb-14">
              <div className="max-w-[48rem]">
                <p
                  className="text-[0.72rem] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: "var(--gold)" }}
                >
                  Choose your stay language
                </p>
                <h2
                  id="live-india-soul-title"
                  className="mt-4 font-sans text-[2.4rem] font-medium leading-none tracking-[-0.07em] sm:text-[4rem] lg:text-[6rem]"
                  style={{ color: "#1f2329" }}
                >
                  Live India Soul
                </h2>
                <p
                  className="mt-4 max-w-[32rem] font-serif text-base leading-relaxed sm:text-lg"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Choose how you want to experience India
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border transition hover:scale-105 sm:size-12"
                style={{
                  borderColor: "rgba(32, 60, 76, 0.14)",
                  color: "var(--primary)",
                  backgroundColor: "rgba(255,255,255,0.5)",
                }}
                aria-label="Close Live India Soul overlay"
              >
                <HiOutlineXMark className="text-2xl" />
              </button>
            </div>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.06,
                    },
                  },
                }}
              >
                {experiences.map((experience) => (
                  <ExperienceItem
                    key={experience.id}
                    experience={experience}
                    isActive={activeId === experience.id}
                    isDesktop={isDesktop}
                    onActivate={() => setActiveId(experience.id)}
                    onSelect={() => handleSelect(experience.routeValue)}
                  />
                ))}
              </motion.div>

              <div className="hidden lg:block">
                <div className="sticky top-12 overflow-hidden rounded-[2rem] border p-3 shadow-[0_28px_80px_rgba(32,60,76,0.12)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeExperience.id}
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -18, scale: 0.98 }}
                      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]"
                    >
                      <Image
                        src={activeExperience.image}
                        alt={activeExperience.imageAlt}
                        fill
                        sizes="420px"
                        className="object-cover"
                        priority={isOpen}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,44,56,0.04),rgba(22,44,56,0.42))]" />
                      <div className="absolute inset-x-5 bottom-5 rounded-[1.2rem] border p-4 backdrop-blur-md">
                        <p
                          className="text-[0.65rem] font-semibold uppercase tracking-[0.28em]"
                          style={{ color: "rgba(245,241,232,0.78)" }}
                        >
                          Live India Soul
                        </p>
                        <p
                          className="mt-2 font-sans text-2xl font-semibold tracking-[-0.04em]"
                          style={{ color: "#fff7ee" }}
                        >
                          {activeExperience.title}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
