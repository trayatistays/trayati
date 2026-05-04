import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Montserrat, EB_Garamond, IM_Fell_English, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkShell } from "@/components/clerk-shell";
import { PublicSiteShell } from "@/components/public-site-shell";
import { OfferPopupLoader } from "@/components/offer-popup-loader";
import { absoluteUrl, serializeJsonLd, siteMetadata } from "@/lib/seo";
import { socialLinks } from "@/data/social-links";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const imFellEnglish = IM_Fell_English({
  variable: "--font-im-fell",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    name: "Trayati Stays",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/fevicon/web-app-manifest-512x512.png"),
    image: absoluteUrl("/og-banner.jpg"),
    sameAs: [socialLinks.instagram.url, socialLinks.facebook.url, socialLinks.whatsapp.url],
    email: socialLinks.email,
    telephone: socialLinks.phone,
    areaServed: "India",
  };

  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${ebGaramond.variable} ${imFellEnglish.variable} ${playfairDisplay.variable} h-full`}>
      <head>
        <meta name="naver-site-verification" content="" />
        {/* Favicon — all sizes for Google Search, browsers, and PWA */}
        <link rel="icon" type="image/x-icon" href="/fevicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/fevicon/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/fevicon/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/fevicon/apple-touch-icon.png" />
        <link rel="manifest" href="/fevicon/site.webmanifest" />
        <meta name="theme-color" content="#6B1F1F" />
        {/* Performance */}
        <link rel="preconnect" href="https://lintxbjljzaubwuqhwdf.supabase.co" />
        <link rel="dns-prefetch" href="https://lintxbjljzaubwuqhwdf.supabase.co" />
      </head>
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
        <ClerkShell>
          <Suspense>
            <PublicSiteShell>{children}</PublicSiteShell>
          </Suspense>
          <OfferPopupLoader />
        </ClerkShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
