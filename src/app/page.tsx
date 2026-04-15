import type { Metadata } from "next";
import { HomePageExperience } from "@/components/home-page-experience";

export const metadata: Metadata = {
  title: "Luxury Stays in Kasar Devi, Dharamshala, Jaisalmer and Varkala",
  description:
    "Book Trayati Stays across India's most soulful destinations, from Himalayan villas in Kasar Devi to heritage stays in Jaisalmer and sea-view escapes in Varkala.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePageExperience />;
}
