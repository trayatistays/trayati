"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FeaturedStay } from "@/data/featured-stays";
import { PropertyPhotoCarousel } from "@/components/property-photo-carousel";
import { PropertyRoomDetails } from "@/components/property-room-details";
import { PropertyAmenities } from "@/components/property-amenities";
import { PropertyPolicies } from "@/components/property-policies";
import { PropertyBookingWidget } from "@/components/property-booking-widget";

export function PropertyPageClient({ stay }: { stay: FeaturedStay }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  return (
    <main style={{ backgroundColor: "var(--background)" }}>
      <div
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,233,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stays
          </Link>
          <div className="flex items-center gap-2" style={{ color: "var(--cta)" }}>
            <span className="font-bold">&#9733; {stay.rating.toFixed(1)}</span>
            <span className="text-sm" style={{ color: "var(--muted)" }}>{stay.type}</span>
          </div>
        </div>
      </div>

      <motion.div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div>
          <PropertyPhotoCarousel photos={stay.photos.length > 0 ? stay.photos : stay.image ? [stay.image] : []} title={`${stay.title} in ${stay.city}`} />
        </div>
      </motion.div>

      <motion.div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" variants={containerVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-12 lg:col-span-2">
            <motion.div variants={itemVariants}>
              <div className="mb-4">
                <span
                  className="inline-block rounded-full px-4 py-2 text-sm font-bold"
                  style={{ backgroundColor: "rgba(164,108,43,0.12)", color: "var(--cta)" }}
                >
                  {stay.tag}
                </span>
              </div>
              <h1
                className="mb-3 font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl"
                style={{ color: "var(--foreground)" }}
              >
                {stay.title} in {stay.city}, {stay.state}
              </h1>
              <p className="text-lg font-medium" style={{ color: "var(--foreground-soft)" }}>{stay.subtitle}</p>
              <p className="mt-2 text-base" style={{ color: "var(--muted)" }}>{stay.location}</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-soft)" }}>{stay.description}</p>
            </motion.div>

            <motion.div variants={itemVariants}><PropertyRoomDetails roomTypes={stay.roomTypes} /></motion.div>
            <motion.div variants={itemVariants}><PropertyAmenities amenitiesDetail={stay.amenitiesDetail} amenitiesList={stay.amenities} /></motion.div>
            <motion.div variants={itemVariants}><PropertyPolicies cancellationPolicies={stay.cancellationPolicies} mealOptions={stay.mealOptions} /></motion.div>
          </div>

          <motion.div variants={itemVariants} className="lg:col-span-1"><PropertyBookingWidget stay={stay} /></motion.div>
        </div>
      </motion.div>

      <motion.section
        className="py-16"
        style={{ backgroundColor: "var(--background-soft)" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div
              className="rounded-xl border p-6 transition hover:shadow-lg"
              style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}
            >
              <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--foreground)" }}>Verified Stay</h3>
              <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>{stay.address}, {stay.city}, {stay.state} {stay.pin}</p>
            </div>
            <div
              className="rounded-xl border p-6 transition hover:shadow-lg"
              style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}
            >
              <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--foreground)" }}>Location-Focused Booking</h3>
              <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>Optimized for travelers searching {stay.city}, {stay.state} stays.</p>
            </div>
            <div
              className="rounded-xl border p-6 transition hover:shadow-lg"
              style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}
            >
              <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--foreground)" }}>Flexible Planning</h3>
              <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>Reserve now and confirm the details around your dates and room choice.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
