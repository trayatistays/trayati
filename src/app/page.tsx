import type { Metadata } from "next";
import { getAllStays } from "@/lib/stays-store";
import { getAllTestimonials } from "@/lib/testimonials-store";
import { getAllExperiences } from "@/lib/experiences-store";
import { getInstagramFeed } from "@/lib/instagram";
import { HomePageExperience } from "@/components/home-page-experience";

export const metadata: Metadata = {
  title: "Luxury Stays in Kasar Devi, Dharamshala, Jaisalmer and Varkala",
  description:
    "Book Trayati Stays across India's most soulful destinations, from Himalayan villas in Kasar Devi to heritage stays in Jaisalmer and sea-view escapes in Varkala.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  // Fetch all homepage data in parallel on the server — zero client-side API calls
  const [stays, testimonials, experiences, instagramItems] = await Promise.all([
    getAllStays(),
    getAllTestimonials(),
    getAllExperiences(),
    getInstagramFeed(),
  ]);

  return (
    <HomePageExperience
      stays={stays}
      testimonials={testimonials}
      experiences={experiences}
      instagramItems={instagramItems}
      instagramUsingFallback={!process.env.INSTAGRAM_ACCESS_TOKEN}
    />
  );
}
