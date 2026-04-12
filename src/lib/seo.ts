import type { Metadata } from "next";
import type { FeaturedStay } from "@/data/featured-stays";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trayatistays.com";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Trayati Stays",
  title: {
    default: "Trayati Stays | Luxury Stays Across India",
    template: "%s | Trayati Stays",
  },
  description:
    "Discover premium villas, mountain retreats, heritage stays, and curated travel experiences across India's most soulful destinations.",
  keywords: [
    "Trayati Stays",
    "luxury stays India",
    "boutique villas India",
    "mountain stays",
    "heritage stays",
    "holiday rentals India",
  ],
  alternates: {
    canonical: "/",
  },
  category: "travel",
  openGraph: {
    type: "website",
    siteName: "Trayati Stays",
    title: "Trayati Stays | Luxury Stays Across India",
    description:
      "Discover premium villas, mountain retreats, heritage stays, and curated travel experiences across India's most soulful destinations.",
    url: siteUrl,
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630, alt: "Trayati Stays — Curated Boutique Stays Across India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trayati Stays | Luxury Stays Across India",
    description:
      "Discover premium villas, mountain retreats, heritage stays, and curated travel experiences across India's most soulful destinations.",
    images: ["/og-banner.jpg"],
  },
};

export function buildStayMetadata(stay: FeaturedStay): Metadata {
  const title = `${stay.title} in ${stay.city}, ${stay.state}`;
  const description = `${stay.title} is a ${stay.type.toLowerCase()} in ${stay.city}, ${stay.state}. ${stay.description}`;
  const url = `/property/${stay.id}`;

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
      images: [stay.image],
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
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Browse Stays",
        item: `${siteUrl}/booking`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: stay.title,
        item: `${siteUrl}/property/${stay.id}`,
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
    url: `${siteUrl}/property/${stay.id}`,
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
    amenityFeature: stay.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };
}
