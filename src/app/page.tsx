import { HeroSection } from "@/components/hero-section";
import { FeaturedStaysSection } from "@/components/featured-stays-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ExperiencesSection } from "@/components/experiences-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedStaysSection />
      <TestimonialsSection />
      <ExperiencesSection />
    </main>
  );
}
