import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Montserrat, EB_Garamond, IM_Fell_English, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkShell } from "@/components/clerk-shell";
import { PublicSiteShell } from "@/components/public-site-shell";
import { OfferPopupLoader } from "@/components/offer-popup-loader";
import { siteMetadata } from "@/lib/seo";
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
    "@type": "Organization",
    name: "Trayati Stays",
    url: siteMetadata.metadataBase?.toString(),
    logo: `${siteMetadata.metadataBase?.toString() ?? ""}/trayati-logo.jpg`,
    sameAs: [socialLinks.instagram.url, socialLinks.facebook.url, socialLinks.whatsapp.url],
    email: socialLinks.email,
    telephone: socialLinks.phone,
  };

  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${ebGaramond.variable} ${imFellEnglish.variable} ${playfairDisplay.variable} h-full`}>
      <head>
        <meta name="naver-site-verification" content="" />
        <link rel="preconnect" href="https://lintxbjljzaubwuqhwdf.supabase.co" />
        <link rel="dns-prefetch" href="https://lintxbjljzaubwuqhwdf.supabase.co" />
        {/* Preconnect to Clerk to reduce auth SDK load time */}
        <link rel="preconnect" href="https://flowing-trout-96.clerk.accounts.dev" crossOrigin="anonymous" />
        {/* Preload hero LCP image — eliminates 1.3s resource load delay */}
        <link
          rel="preload"
          as="image"
          href="https://lintxbjljzaubwuqhwdf.supabase.co/storage/v1/object/public/trayati-media/admin/background.jpg"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ClerkShell>
          <Suspense>
            <PublicSiteShell>{children}</PublicSiteShell>
          </Suspense>
          {/* Offer popup — loaded only client-side, zero SSR overhead */}
          <OfferPopupLoader />
        </ClerkShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
