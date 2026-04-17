"use client";

import { HeroSection } from "@/components/hero-section";
import { FeaturedStaysSection } from "@/components/featured-stays-section";
import { InstagramCarousel } from "@/components/instagram-carousel";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ExperiencesSection } from "@/components/experiences-section";

export function HomePageExperience() {
  return (
    <main className="home-depth-shell min-h-screen">
      <HeroSection />

      <div className="relative z-10 pb-10 sm:pb-16 lg:pb-24">
        <FeaturedStaysSection />
        <div className="-mt-4 sm:-mt-2">
          <ExperiencesSection />
        </div>
        <TestimonialsSection />
        <InstagramCarousel />
      </div>
    </main>
  );
}
