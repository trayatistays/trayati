"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { use } from "react";
import { featuredStays } from "@/data/featured-stays";
import { PropertyPhotoCarousel } from "@/components/property-photo-carousel";
import { PropertyRoomDetails } from "@/components/property-room-details";
import { PropertyAmenities } from "@/components/property-amenities";
import { PropertyPolicies } from "@/components/property-policies";
import { PropertyBookingWidget } from "@/components/property-booking-widget";

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params);
  const stay = featuredStays.find((s) => s.id === id);

  if (!stay) {
    notFound();
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <main className="bg-white">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Stays
          </Link>
          <div className="flex items-center gap-2 text-amber-600">
            <span className="font-bold">★ {stay.rating.toFixed(1)}</span>
            <span className="text-sm text-slate-600">({stay.type})</span>
          </div>
        </div>
      </div>

      {/* Hero Section - Photo Gallery */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-96 md:h-[28rem] rounded-3xl overflow-hidden shadow-2xl">
          <PropertyPhotoCarousel photos={stay.photos} title={stay.title} />
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header */}
            <motion.div variants={itemVariants}>
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                  {stay.tag}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                {stay.title}
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                {stay.subtitle}
              </p>
              <p className="text-base text-slate-500 mt-2">
                {stay.location}
              </p>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="prose prose-slate">
              <p className="text-lg text-slate-700 leading-relaxed">
                {stay.description}
              </p>
            </motion.div>

            {/* Room Types */}
            <motion.div variants={itemVariants}>
              <PropertyRoomDetails roomTypes={stay.roomTypes} />
            </motion.div>

            {/* Amenities */}
            <motion.div variants={itemVariants}>
              <PropertyAmenities
                amenitiesDetail={stay.amenitiesDetail}
                amenitiesList={stay.amenities}
              />
            </motion.div>

            {/* Policies & Meals */}
            <motion.div variants={itemVariants}>
              <PropertyPolicies
                cancellationPolicies={stay.cancellationPolicies}
                mealOptions={stay.mealOptions}
              />
            </motion.div>
          </div>

          {/* Right Column - Sticky Widget */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <PropertyBookingWidget stay={stay} />
          </motion.div>
        </div>
      </motion.div>

      {/* More Details Section */}
      <motion.section
        className="bg-gradient-to-b from-slate-50 to-white py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Info Cards */}
            <div className="rounded-xl bg-white border border-slate-200 p-6 hover:shadow-lg transition">
              <div className="text-amber-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Verified Stay
              </h3>
              <p className="text-slate-600 text-sm">
                {stay.address}, {stay.city}, {stay.state} {stay.pin}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-6 hover:shadow-lg transition">
              <div className="text-amber-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Quick Response
              </h3>
              <p className="text-slate-600 text-sm">
                Typically responds within 2 hours
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-6 hover:shadow-lg transition">
              <div className="text-amber-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 9 15.5 9 14 9.67 14 10.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 9 8.5 9 7 9.67 7 10.5 7.67 12 8.5 12zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Flexible Cancellation
              </h3>
              <p className="text-slate-600 text-sm">
                Free cancellation up to 7 days before
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="bg-gradient-to-r from-amber-600 to-orange-600 py-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to book your stay?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Secure your perfect getaway at {stay.title}
          </p>
          <Link
            href={`/booking?stayId=${stay.id}`}
            className="inline-block bg-white text-amber-600 hover:bg-slate-100 font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Reserve Now
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
