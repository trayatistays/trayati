import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse & Book Curated Stays Across India",
  description:
    "Search and book verified folk homestays, villas, and heritage stays across India. Filter by location, dates, and experience type. Instant enquiry via WhatsApp.",
  keywords: [
    "book boutique stay India",
    "villa rental India",
    "heritage homestay booking",
    "Kasar Devi villa booking",
    "Jaisalmer heritage hotel",
    "Varkala sea view villa",
    "luxury stay Uttarakhand",
  ],
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Browse & Book Curated Stays — Trayati Stays",
    description:
      "Find and book India's most authentic boutique stays. Verified properties, transparent pricing, WhatsApp support.",
    url: "/booking",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Book a Stay — Trayati Stays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Curated Stays — Trayati Stays",
    description: "Search India's best boutique stays and book instantly.",
    images: ["/og-banner.jpg"],
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
