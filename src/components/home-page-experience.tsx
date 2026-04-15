"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroSection } from "@/components/hero-section";
import { FeaturedStaysSection } from "@/components/featured-stays-section";
import { InstagramCarousel } from "@/components/instagram-carousel";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ExperiencesSection } from "@/components/experiences-section";

function DepthSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 8%"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [72, 0, -24]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 1], [0.35, 0.85, 1, 0.92]);

  return (
    <motion.div
      ref={ref}
      style={{ y, rotateX, opacity, transformPerspective: 1800 }}
      className={`relative z-10 transform-gpu will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HomePageExperience() {
  const { scrollYProgress } = useScroll();
  const orbOneY = useTransform(scrollYProgress, [0, 1], ["-6%", "16%"]);
  const orbTwoY = useTransform(scrollYProgress, [0, 1], ["10%", "-14%"]);
  const orbThreeY = useTransform(scrollYProgress, [0, 1], ["-8%", "24%"]);
  const orbOneRotate = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const orbTwoRotate = useTransform(scrollYProgress, [0, 1], [0, -14]);
  const orbThreeRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);

  return (
    <main className="home-depth-shell min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ y: orbOneY, rotate: orbOneRotate }}
          className="home-depth-orb home-depth-orb--sage"
        />
        <motion.div
          style={{ y: orbTwoY, rotate: orbTwoRotate }}
          className="home-depth-orb home-depth-orb--gold"
        />
        <motion.div
          style={{ y: orbThreeY, rotate: orbThreeRotate }}
          className="home-depth-orb home-depth-orb--ink"
        />
        <div className="home-depth-grid" />
      </div>

      <HeroSection />

      <div className="relative z-10 pb-10 sm:pb-16 lg:pb-24">
        <DepthSection>
          <FeaturedStaysSection />
        </DepthSection>
        <DepthSection className="-mt-4 sm:-mt-2">
          <ExperiencesSection />
        </DepthSection>
        <DepthSection>
          <TestimonialsSection />
        </DepthSection>
        <DepthSection>
          <InstagramCarousel />
        </DepthSection>
      </div>
    </main>
  );
}
