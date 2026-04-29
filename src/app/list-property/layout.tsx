import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "List Your Property With Trayati Stays",
  description:
    "Partner with Trayati Stays to list boutique villas, heritage homes, homestays, and soulful stays across India.",
  alternates: { canonical: "/list-property" },
  openGraph: {
    title: "List Your Property With Trayati Stays",
    description:
      "Reach travellers looking for authentic, curated stays across India with Trayati Stays.",
    url: "/list-property",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "List your property with Trayati Stays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Property With Trayati Stays",
    description: "Partner with Trayati Stays to list your boutique or heritage property.",
    images: ["/og-banner.jpg"],
  },
};

export default function ListPropertyLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
