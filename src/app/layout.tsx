import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ClerkShell } from "@/components/clerk-shell";
import { siteMetadata } from "@/lib/seo";
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

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ClerkShell>{children}</ClerkShell>
      </body>
    </html>
  );
}
