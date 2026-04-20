"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface BookingSession {
  id: string;
  stayId: string;
  stayTitle: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  mealOption?: string;
  nights: number;
  roomTotal: number;
  mealTotal: number;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

export default function BookingCheckoutPage({
  params,
}: {
  params: Promise<{ bookingSessionId: string }>;
}) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [bookingSessionId, setBookingSessionId] = useState<string>("");
  const [booking, setBooking] = useState<BookingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setBookingSessionId(resolvedParams.bookingSessionId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!bookingSessionId) return;

    async function fetchBookingSession() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/booking-session/${bookingSessionId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Booking session not found");
            return;
          }
          throw new Error("Failed to load booking");
        }

        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking details"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookingSession();
  }, [bookingSessionId]);

  const handlePayment = async () => {
    if (!booking || !isSignedIn) return;

    setIsProcessing(true);

    try {
      // Create Razorpay order via booking payment endpoint
      const orderResponse = await fetch("/api/create-booking-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingSessionId: booking.id,
          totalAmount: booking.totalAmount,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create payment order");
      }

      const { orderId, amount } = await orderResponse.json();

      // Initialize Razorpay payment
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          order_id: orderId,
          amount: amount,
          currency: "INR",
          name: "Trayati Stays",
          description: `Booking at ${booking.stayTitle}`,
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              // Verify payment and create booking
              const verifyResponse = await fetch("/api/verify-booking-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  bookingSessionId: booking.id,
                }),
              });

              if (!verifyResponse.ok) {
                throw new Error("Payment verification failed");
              }

              const data = await verifyResponse.json();

              // Redirect to confirmation page
              router.push(
                `/booking-confirmation/${data.bookingId}`
              );
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Payment verification failed"
              );
              setIsProcessing(false);
            }
          },
          prefill: {
            name: "Guest",
            email: "guest@example.com",
          },
          theme: {
            color: "#a46c2b",
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        throw new Error("Razorpay is not available");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment initialization failed"
      );
      setIsProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Please sign in to continue with payment</p>
          <Link
            href="/sign-in"
            className="inline-block bg-[var(--primary)] text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Booking not found"}</p>
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
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,233,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
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
            Back
          </Link>
          <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            / Checkout
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Booking Summary */}
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: "rgba(245,241,233,0.98)",
            }}
          >
            <h2 className="text-2xl font-bold">Order Summary</h2>

            <div className="space-y-3 border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  PROPERTY
                </p>
                <h3 className="text-lg font-bold">{booking.stayTitle}</h3>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  ROOM
                </p>
                <p className="font-semibold">{booking.roomName}</p>
              </div>
            </div>

            <div className="space-y-3 border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
              <div className="flex justify-between">
                <span>Check-in</span>
                <span className="font-semibold">
                  {new Date(booking.checkIn).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Check-out</span>
                <span className="font-semibold">
                  {new Date(booking.checkOut).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold">
                  {booking.nights} night{booking.nights !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span className="font-semibold">{booking.guests}</span>
              </div>
            </div>

            {booking.mealOption && (
              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  MEAL PLAN
                </p>
                <p className="font-semibold">{booking.mealOption}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Room ({booking.nights} nights)</span>
                <span>₹{booking.roomTotal.toLocaleString()}</span>
              </div>
              {booking.mealTotal > 0 && (
                <div className="flex justify-between">
                  <span>Meals</span>
                  <span>₹{booking.mealTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2" style={{ borderColor: "var(--border-soft)" }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{booking.subtotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{booking.gstAmount.toLocaleString()}</span>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold" style={{ color: "var(--primary)" }}>
                    ₹{booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="rounded-lg p-4 text-sm"
              style={{
                backgroundColor: "rgba(255,0,0,0.1)",
                borderLeft: "4px solid #ff0000",
              }}
            >
              <p style={{ color: "#cc0000" }}>{error}</p>
            </div>
          )}

          {/* Payment Button */}
          <motion.button
            onClick={handlePayment}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-lg py-3 font-bold text-white transition disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary)",
            }}
          >
            {isProcessing ? "Processing..." : `Pay ₹${booking.totalAmount.toLocaleString()}`}
          </motion.button>

          <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
            Secure payment powered by Razorpay
          </p>
        </motion.div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </main>
  );
}
