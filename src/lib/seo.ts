import type { Metadata } from "next";
import type { FeaturedStay } from "@/data/featured-stays";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trayatistays.com";
const ogImage = "/og-banner.jpg";
const logoImage = "/trayati-logo.jpg";

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Trayati Stays",
  title: {
    default: "Trayati Stays | Luxury Stays Across India",
    template: "%s | Trayati Stays",
  },
  description:
    "Discover premium villas, mountain retreats, heritage stays, and curated travel experiences across India's most soulful destinations.",
  alternates: { canonical: "/" },
  publisher: "Trayati Stays",
  creator: "Trayati Stays",
  keywords: [
    "Trayati Stays",
    "luxury stays India",
    "boutique villas India",
    "mountain stays",
    "heritage stays",
    "holiday rentals India",
  ],
  category: "travel",
  openGraph: {
    type: "website",
    siteName: "Trayati Stays",
    title: "Trayati Stays | Luxury Stays Across India",
    description:
      "Discover premium villas, mountain retreats, heritage stays, and curated travel experiences across India's most soulful destinations.",
    url: siteUrl,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Trayati Stays - Curated Boutique Stays Across India" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trayati Stays | Luxury Stays Across India",
    description:
      "Discover premium villas, mountain retreats, heritage stays, and curated travel experiences across India's most soulful destinations.",
    images: [ogImage],
  },
  icons: {
    icon: "/favicon.ico",
    apple: logoImage,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export function buildStayMetadata(stay: FeaturedStay): Metadata {
  const title = `${stay.title} in ${stay.city}, ${stay.state}`;
  const description = `${stay.title} is a ${stay.type.toLowerCase()} in ${stay.city}, ${stay.state}. ${stay.description}`;
  const url = absoluteUrl(`/property/${stay.id}`);

  return {
    title,
    description,
    keywords: [
      stay.title,
      `${stay.city} stay`,
      `${stay.state} stay`,
      `${stay.city} ${stay.type}`,
      `${stay.city} luxury stay`,
      `${stay.state} boutique stay`,
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: stay.image, alt: stay.alt || title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [stay.image],
    },
  };
}

export function buildBreadcrumbJsonLd(stay: FeaturedStay) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Browse Stays",
        item: absoluteUrl("/booking"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: stay.title,
        item: absoluteUrl(`/property/${stay.id}`),
      },
    ],
  };
}

export function buildStayJsonLd(stay: FeaturedStay) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: stay.title,
    description: stay.description,
    image: stay.photos.length ? stay.photos : [stay.image],
    url: absoluteUrl(`/property/${stay.id}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: stay.address,
      addressLocality: stay.city,
      addressRegion: stay.state,
      postalCode: stay.pin,
      addressCountry: stay.country,
    },
    aggregateRating: stay.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: stay.rating,
          reviewCount: stay.reviewCount ?? 10,
        }
      : undefined,
    priceRange: `INR ${stay.pricePerNight}`,
    amenityFeature: (Array.isArray(stay.amenities) ? stay.amenities : []).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };
}
