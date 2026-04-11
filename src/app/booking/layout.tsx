import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Premium Stays by Location Across India",
  description:
    "Search and reserve premium stays by destination, from mountain retreats and heritage properties to sea-view villas across India.",
  alternates: { canonical: "/booking" },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
