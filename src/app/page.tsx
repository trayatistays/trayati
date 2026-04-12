import type { Metadata } from "next";
import { HeroSection } from "@/components/hero-section";
import { FeaturedStaysSection } from "@/components/featured-stays-section";
import { InstagramCarousel } from "@/components/instagram-carousel";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ExperiencesSection } from "@/components/experiences-section";

export const metadata: Metadata = {
  title: "Luxury Stays in Kasar Devi, Dharamshala, Jaisalmer and Varkala",
  description:
    "Book Trayati Stays across India's most soulful destinations, from Himalayan villas in Kasar Devi to heritage stays in Jaisalmer and sea-view escapes in Varkala.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedStaysSection />
      <ExperiencesSection />
      <TestimonialsSection />
      <InstagramCarousel />
    </main>
  );
}
