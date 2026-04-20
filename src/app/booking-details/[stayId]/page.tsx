import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { getStayById } from "@/lib/stays-api";
import BookingDetailsClient from "./booking-details-client";

const STAYS_CACHE_PROFILE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
};

export async function generateMetadata({ params }: { params: Promise<{ stayId: string }> }) {
  const { stayId } = await params;
  const stay = await getStayById(stayId);

  if (!stay) {
    return { title: "Booking Not Found" };
  }

  return {
    title: `Book ${stay.title} - Trayati Stays`,
    description: `Complete your booking at ${stay.title} in ${stay.city}. Select dates, rooms, and meal options.`,
  };
}

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ stayId: string }>;
}) {
  "use cache";
  cacheLife(STAYS_CACHE_PROFILE);

  const { stayId } = await params;
  const stay = await getStayById(stayId);

  if (!stay) {
    notFound();
  }

  return <BookingDetailsClient stay={stay} />;
}
