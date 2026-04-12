import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Book a Stay or Ask a Question",
  description:
    "Get in touch with Trayati Stays via WhatsApp, email, or our contact form. We respond within 2 hours for all booking enquiries.",
  keywords: [
    "contact Trayati Stays",
    "book heritage stay India",
    "WhatsApp boutique stay booking",
    "Trayati Stays enquiry",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Trayati Stays — We Reply Within 2 Hours",
    description: "Book a stay, ask a question, or just say hi. Our team is on WhatsApp and email every day.",
    url: "/contact",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Contact Trayati Stays" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Trayati Stays",
    description: "Reach us on WhatsApp or email for booking enquiries.",
    images: ["/og-banner.jpg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
