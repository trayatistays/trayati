import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Our Story & Mission",
  description:
    "Trayati Stays was born from a passion for authentic travel. Learn how we curate India's most soulful folklore homestays, villas, and heritage stays for modern travellers.",
  keywords: [
    "about Trayati Stays",
    "India boutique travel platform",
    "authentic heritage stays India",
    "curated travel India",
    "folk homestay India",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Trayati Stays — Born Out of Passion, Driven by Identity",
    description:
      "We curate only the most authentic, handpicked stays across India — from folk homestays to heritage villas. Meet the team behind Trayati Stays.",
    url: "/about",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "About Trayati Stays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Trayati Stays",
    description: "Curating India's most authentic and soulful stays.",
    images: ["/og-banner.jpg"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
