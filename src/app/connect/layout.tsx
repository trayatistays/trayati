import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect With Us — Partner, Collaborate, or List Your Property",
  description:
    "Join the Trayati Stays community. Whether you're a property owner, travel partner, or local experience curator — we'd love to connect and grow together.",
  keywords: [
    "list property Trayati Stays",
    "partner with Trayati",
    "property owner India OTA",
    "boutique stay listing India",
    "travel partnership India",
  ],
  alternates: { canonical: "/connect" },
  openGraph: {
    title: "Connect & Partner With Trayati Stays",
    description: "Become a host, travel partner, or experience curator with Trayati Stays.",
    url: "/connect",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Connect — Trayati Stays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Connect With Trayati Stays",
    description: "Partner with India's most authentic boutique stay platform.",
    images: ["/og-banner.jpg"],
  },
};

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
