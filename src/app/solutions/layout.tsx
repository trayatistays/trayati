import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions — Corporate Retreats, Wellness & Group Travel",
  description:
    "Tailored travel experiences for corporate teams, families, wellness seekers, and groups. Trayati Stays organises bespoke retreats and event hosting across India.",
  keywords: [
    "corporate retreat India",
    "wellness retreat Himalayas",
    "group travel India",
    "family estate rental India",
    "event hosting heritage property",
    "wedding venue heritage India",
  ],
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Solutions — Tailored Travel Experiences by Trayati Stays",
    description: "Corporate retreats, wellness programs, family escapes, and event hosting across India's finest properties.",
    url: "/solutions",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Trayati Stays Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trayati Stays Solutions",
    description: "Bespoke travel experiences — corporate, wellness, groups, and events.",
    images: ["/og-banner.jpg"],
  },
};

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
