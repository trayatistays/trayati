import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://trayati.example"),
  title: "Trayati Stays | Discover and Book Premium Stays",
  description:
    "Trayati Stays helps travelers discover, compare, and book premium stays with a fast, personalised booking experience.",
  keywords: [
    "Trayati",
    "Trayati Stays",
    "OTA platform",
    "book stays",
    "holiday homes",
    "travel booking",
  ],
  openGraph: {
    title: "Trayati Stays",
    description:
      "Discover and book premium stays with effortless, smart, personalised travel planning.",
    images: ["/trayati-logo.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trayati Stays",
    description:
      "Discover and book premium stays with effortless, smart, personalised travel planning.",
    images: ["/trayati-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
