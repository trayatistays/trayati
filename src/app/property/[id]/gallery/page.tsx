import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { getAllStays, getPropertyImages, getStayById } from "@/lib/stays-store";
import { GalleryGrid } from "@/components/property/gallery-grid";

const STAYS_CACHE_PROFILE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
};

export async function generateStaticParams() {
  "use cache";
  cacheLife(STAYS_CACHE_PROFILE);

  const stays = await getAllStays();
  return stays.map((stay) => ({ id: stay.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const stay = await getStayById(id);

  if (!stay) {
    return {
      title: "Gallery Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Photos of ${stay.title} - Trayati Stays`,
    description: `Browse all photos of ${stay.title} in ${stay.city}, ${stay.state} — rooms, amenities, views and more.`,
    // Gallery is a thin image-only page; direct all ranking signals to the parent property page
    alternates: { canonical: `/property/${stay.id}` },
    robots: { index: false, follow: true },
    openGraph: {
      title: `Photos of ${stay.title} - Trayati Stays`,
      description: `Browse all photos of ${stay.title} in ${stay.city}, ${stay.state}.`,
      url: `/property/${stay.id}/gallery`,
      images: [{ url: stay.image, alt: stay.alt || stay.title }],
    },
  };
}

export default async function PropertyGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Fetch details and images using Promise.all for speed
  const [stay, photos] = await Promise.all([
    getStayById(id),
    getPropertyImages(id),
  ]);

  if (!stay) {
    notFound();
  }

  return <GalleryGrid photos={photos || []} propertyId={stay.id} propertyTitle={stay.title} />;
}
