"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { FeaturedStay } from "@/data/featured-stays";
import { PropertyBookingFlow } from "@/components/property-booking-flow";

interface BookingState {
  roomId: string | null;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  mealOption: string | null;
  specialRequests: string;
}

export default function BookingDetailsClient({ stay }: { stay: FeaturedStay }) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBookingComplete = async (booking: BookingState) => {
    setIsProcessing(true);

    try {
      if (!isSignedIn || !user) {
        // Store booking in localStorage for after sign-in
        localStorage.setItem(
          "pending_booking",
          JSON.stringify({
            stayId: stay.id,
            booking,
          })
        );

        // Redirect to sign in and back to this page
        router.push(`/sign-in?redirect_url=${window.location.pathname}`);
        return;
      }

      // Create booking via API
      const response = await fetch("/api/create-booking-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayId: stay.id,
          ...booking,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const data = await response.json();

      // Redirect to checkout with booking session ID
      router.push(`/booking-checkout/${data.bookingSessionId}`);
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,233,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/property/${stay.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Property
          </Link>
          <div style={{ color: "var(--cta)" }}>
            <span className="text-sm font-semibold">Booking Details</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Left: Booking Flow */}
          <div className="lg:col-span-2">
            <PropertyBookingFlow
              stay={stay}
              onBookingComplete={handleBookingComplete}
            />
          </div>

          {/* Right: Property Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-fit sticky top-24 space-y-4 rounded-xl border p-4"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(245,241,233,0.98)",
            }}
          >
            <div>
              <img
                src={stay.image || "/placeholder.jpg"}
                alt={stay.title}
                className="w-full rounded-lg object-cover aspect-video"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                {stay.city}, {stay.state}
              </p>
              <h3 className="text-lg font-bold">{stay.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                  ★ {stay.rating.toFixed(1)}
                </span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {stay.type}
                </span>
              </div>
            </div>

            <div
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: "rgba(164,108,43,0.05)" }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                STARTING FROM
              </p>
              <p className="text-2xl font-bold">
                ₹{Math.min(...stay.roomTypes.map((r) => r.pricePerNight)).toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>/night</p>
            </div>

            <div className="space-y-2 border-t pt-4" style={{ borderColor: "var(--border-soft)" }}>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "var(--primary)" }}
                >
                  <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6" />
                </svg>
                <span>Free cancellation up to 24hrs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "var(--primary)" }}
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verified property</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "var(--primary)" }}
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span>24/7 support</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
