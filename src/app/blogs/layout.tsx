import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Stories & Guides — Trayati Blog",
  description:
    "Discover travel stories, destination guides, and inspiration from India's most soulful places — Kasar Devi, Jaisalmer, Varkala, Dharamshala and beyond.",
  keywords: [
    "India travel blog",
    "Kasar Devi travel guide",
    "Uttarakhand travel tips",
    "heritage travel India",
    "boutique stay stories",
    "Jaisalmer desert stay guide",
    "Varkala Kerala travel",
  ],
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Travel Stories & Guides — Trayati Stays Blog",
    description: "Tips, inspiration, and stories from travellers and destinations across India.",
    url: "/blogs",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Trayati Travel Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trayati Travel Blog",
    description: "Travel stories and destination guides from across India.",
    images: ["/og-banner.jpg"],
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
