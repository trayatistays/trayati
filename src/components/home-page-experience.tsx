"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/hero-section";
import { FeaturedStaysSection } from "@/components/featured-stays-section";
import type { FeaturedStay } from "@/data/featured-stays";
import type { Testimonial, Experience } from "@/data/testimonials-and-blogs";
import type { InstagramMediaItem } from "@/lib/instagram";

// Lazy-load below-fold sections — code-split to reduce initial JS bundle
const TestimonialsSection = dynamic(
  () => import("@/components/testimonials-section").then((m) => ({ default: m.TestimonialsSection })),
);
const ExperiencesSection = dynamic(
  () => import("@/components/experiences-section").then((m) => ({ default: m.ExperiencesSection })),
);
const InstagramCarousel = dynamic(
  () => import("@/components/instagram-carousel").then((m) => ({ default: m.InstagramCarousel })),
);

type HomePageExperienceProps = {
  stays: FeaturedStay[];
  testimonials: Testimonial[];
  experiences: Experience[];
  instagramItems: InstagramMediaItem[];
  instagramUsingFallback: boolean;
};

export function HomePageExperience({
  stays,
  testimonials,
  experiences,
  instagramItems,
  instagramUsingFallback,
}: HomePageExperienceProps) {
  return (
    <main className="home-depth-shell min-h-screen">
      <HeroSection />

      <div className="relative z-10 pb-10 sm:pb-16 lg:pb-24">
        <FeaturedStaysSection stays={stays} />
        <div className="-mt-4 sm:-mt-2 perf-cv-auto">
          <ExperiencesSection experiences={experiences} />
        </div>
        <div className="perf-cv-auto">
          <TestimonialsSection testimonials={testimonials} />
        </div>
        <div className="perf-cv-auto">
          <InstagramCarousel
            items={instagramItems}
            usingFallback={instagramUsingFallback}
          />
        </div>
      </div>
    </main>
  );
}
