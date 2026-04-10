import { HeroSection } from "@/components/hero-section";
import { FeaturedStaysSection } from "@/components/featured-stays-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedStaysSection />
    </main>
  );
}
