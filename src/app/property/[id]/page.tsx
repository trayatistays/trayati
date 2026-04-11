import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyPageClient } from "@/components/property-page-client";
import { getStayById } from "@/lib/stays-store";
import { buildStayJsonLd, buildStayMetadata } from "@/lib/seo";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
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

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const stay = await getStayById(id);

  if (!stay) {
    notFound();
  }

  const jsonLd = buildStayJsonLd(stay);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PropertyPageClient stay={stay} />
    </>
  );
}
