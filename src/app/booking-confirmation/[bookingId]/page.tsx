"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BookingConfirmation {
  id: string;
  stayTitle: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  invoiceNumber: string;
}

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const [bookingId, setBookingId] = useState<string>("");
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setBookingId(resolvedParams.bookingId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    async function fetchBooking() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/booking/${bookingId}`);

        if (!response.ok) {
          throw new Error("Failed to load booking confirmation");
        }

        const data = await response.json();
        setBooking(data.booking);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading booking confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Booking confirmation not found</p>
          <Link
            href="/"
            className="inline-block bg-[var(--primary)] text-white px-6 py-2 rounded-lg"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main style={{ backgroundColor: "var(--background)" }}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(164,108,43,0.1)" }}
            >
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--primary)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          </div>

          {/* Confirmation Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              Your reservation has been successfully confirmed.
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
              A confirmation email has been sent to your email address.
            </p>
          </motion.div>

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border p-8 mb-8"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(245,241,233,0.98)",
            }}
          >
            <div className="space-y-6">
              {/* Booking ID */}
              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                  BOOKING ID
                </p>
                <p className="font-mono font-bold text-lg">{booking.id}</p>
              </div>

              {/* Property Details */}
              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
                  PROPERTY
                </p>
                <h3 className="text-lg font-bold">{booking.stayTitle}</h3>
                <p className="text-sm mt-1">{booking.roomName}</p>
              </div>

              {/* Travel Dates */}
              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
                  TRAVEL DATES
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Check-In
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Check-Out
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.checkOut).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guests & Invoice */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    GUESTS
                  </p>
                  <p className="text-lg font-bold">{booking.guests}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    TOTAL PAID
                  </p>
                  <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                    ₹{booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Invoice Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-4 mb-8"
            style={{
              backgroundColor: "rgba(164,108,43,0.05)",
              borderLeft: "4px solid var(--primary)",
            }}
          >
            <p className="text-sm mb-2 font-semibold">Invoice Available</p>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Invoice #{booking.invoiceNumber}
            </p>
            <Link
              href={`/api/invoices/${booking.invoiceNumber}`}
              className="inline-block text-sm font-semibold"
              style={{ color: "var(--primary)" }}
            >
              Download Invoice →
            </Link>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl p-6 mb-8"
            style={{
              backgroundColor: "var(--border-soft)",
            }}
          >
            <h3 className="font-bold mb-4">What's Next?</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-1 h-4 w-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  Check your email for booking confirmation and property details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-1 h-4 w-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  Review cancellation policies and house rules
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-1 h-4 w-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  Contact us if you have any special requests or questions
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/"
              className="flex-1 rounded-lg py-3 px-4 text-center font-semibold text-white transition hover:shadow-lg"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="flex-1 rounded-lg py-3 px-4 text-center font-semibold transition border-2"
              style={{
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              Contact Support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
