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
    <main className="bg-white">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 font-medium text-slate-600 transition hover:text-slate-900">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stays
          </Link>
          <div className="flex items-center gap-2 text-amber-600">
            <span className="font-bold">? {stay.rating.toFixed(1)}</span>
            <span className="text-sm text-slate-600">{stay.type}</span>
          </div>
        </div>
      </div>

      <motion.div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="h-80 overflow-hidden rounded-[1.75rem] shadow-2xl sm:h-96 md:h-[32rem]">
          <PropertyPhotoCarousel photos={stay.photos} title={`${stay.title} in ${stay.city}`} />
        </div>
      </motion.div>

      <motion.div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" variants={containerVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-12 lg:col-span-2">
            <motion.div variants={itemVariants}>
              <div className="mb-4"><span className="inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">{stay.tag}</span></div>
              <h1 className="mb-3 text-4xl font-bold tracking-[-0.04em] text-slate-900 md:text-5xl">{stay.title} in {stay.city}, {stay.state}</h1>
              <p className="text-lg font-medium text-slate-600">{stay.subtitle}</p>
              <p className="mt-2 text-base text-slate-500">{stay.location}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-slate-700">{stay.description}</p>
            </motion.div>

            <motion.div variants={itemVariants}><PropertyRoomDetails roomTypes={stay.roomTypes} /></motion.div>
            <motion.div variants={itemVariants}><PropertyAmenities amenitiesDetail={stay.amenitiesDetail} amenitiesList={stay.amenities} /></motion.div>
            <motion.div variants={itemVariants}><PropertyPolicies cancellationPolicies={stay.cancellationPolicies} mealOptions={stay.mealOptions} /></motion.div>
          </div>

          <motion.div variants={itemVariants} className="lg:col-span-1"><PropertyBookingWidget stay={stay} /></motion.div>
        </div>
      </motion.div>

      <motion.section className="bg-gradient-to-b from-slate-50 to-white py-16" variants={containerVariants} initial="hidden" animate="visible">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"><h3 className="mb-2 text-lg font-bold text-slate-900">Verified Stay</h3><p className="text-sm text-slate-600">{stay.address}, {stay.city}, {stay.state} {stay.pin}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"><h3 className="mb-2 text-lg font-bold text-slate-900">Location-Focused Booking</h3><p className="text-sm text-slate-600">Optimized for travelers searching {stay.city}, {stay.state} stays.</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"><h3 className="mb-2 text-lg font-bold text-slate-900">Flexible Planning</h3><p className="text-sm text-slate-600">Reserve now and confirm the details around your dates and room choice.</p></div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
