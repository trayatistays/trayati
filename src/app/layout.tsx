import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Montserrat, EB_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkShell } from "@/components/clerk-shell";
import { PublicSiteShell } from "@/components/public-site-shell";
import { siteMetadata } from "@/lib/seo";
import { socialLinks } from "@/data/social-links";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${ebGaramond.variable} h-full`}>
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ClerkShell>
          <Suspense>
            <PublicSiteShell>{children}</PublicSiteShell>
          </Suspense>
        </ClerkShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
