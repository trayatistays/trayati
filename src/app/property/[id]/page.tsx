import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { PropertyPageClient } from "@/components/property-page-client";
import { getStayById } from "@/lib/stays-api";
import { getAllStays } from "@/lib/stays-store";
import { buildStayJsonLd, buildStayMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

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
      title: "Stay Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildStayMetadata(stay);
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stay = await getStayById(id);

  if (!stay) {
    notFound();
  }

  const jsonLd = buildStayJsonLd(stay);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(stay);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PropertyPageClient stay={stay} />
    </>
  );
}
