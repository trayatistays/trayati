"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BookingRecord } from "@/lib/booking/types";
import type { Review } from "@/lib/types";

type ReviewForm = {
  rating: number;
  cleanlinessRating: number;
  locationRating: number;
  valueRating: number;
  title: string;
  comment: string;
};

const initialReviewForm: ReviewForm = {
  rating: 0,
  cleanlinessRating: 0,
  locationRating: 0,
  valueRating: 0,
  title: "",
  comment: "",
};

function StarRating({ value, onChange, size = 24 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= value ? "#f59e0b" : "none"}
            stroke={star <= value ? "#f59e0b" : "#d1d5db"}
            strokeWidth={2}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [stayName, setStayName] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(initialReviewForm);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided.");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/bookings/${bookingId}`).then((res) => res.json()),
      fetch(`/api/reviews?bookingId=${bookingId}`).then((res) => res.json()),
    ])
      .then(([bookingData, reviewData]) => {
        if (bookingData.error) {
          throw new Error(bookingData.error);
        }
        setBooking(bookingData.booking);
        setStayName(bookingData.stayName ?? "");
        
        if (reviewData.review) {
          setExistingReview(reviewData.review);
        }
        
        return fetch(`/api/invoices/INV-${bookingId?.slice(0, 8)}`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.invoice) {
          setInvoiceNumber(data.invoice.invoiceNumber);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  async function submitReview() {
    if (!booking || reviewForm.rating === 0) return;
    
    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: reviewForm.rating,
          cleanlinessRating: reviewForm.cleanlinessRating || null,
          locationRating: reviewForm.locationRating || null,
          valueRating: reviewForm.valueRating || null,
          title: reviewForm.title || null,
          comment: reviewForm.comment || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit review");
      }

      setExistingReview(data.review);
      setReviewSubmitted(true);
      setShowReviewForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "var(--primary)" }} />
          <p className="mt-4" style={{ color: "var(--muted)" }}>Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-display text-2xl font-bold mb-2">Booking Not Found</h1>
          <p className="mb-6" style={{ color: "var(--muted)" }}>{error || "We couldn't find your booking."}</p>
          <Link
            href="/booking"
            className="inline-block rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const checkIn = new Date(booking.startDate);
  const checkOut = new Date(booking.endDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const addCalendarLinks = {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Trayati%20Stay&dates=${booking.startDate.replace(/-/g, "")}/${booking.endDate.replace(/-/g, "")}&details=Booking%20ID:%20${booking.id}`,
    apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${booking.startDate.replace(/-/g, "")}%0ADTEND:${booking.endDate.replace(/-/g, "")}%0ASUMMARY:Trayati%20Stay%0ADESCRIPTION:Booking%20ID:%20${booking.id}%0AEND:VEVENT%0AEND:VCALENDAR`,
  };

  return (
    <main className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(74,101,68,0.1)" }}
          >
            <svg className="w-10 h-10" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em] mb-2">Booking Confirmed!</h1>
          <p style={{ color: "var(--muted)" }}>Your reservation has been successfully confirmed.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[2rem] border p-6 mb-6"
          style={{
            backgroundColor: "rgba(245,241,232,0.92)",
            borderColor: "rgba(74,101,68,0.18)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Booking Details</h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase"
              style={{ backgroundColor: "rgba(74,101,68,0.1)", color: "var(--primary)" }}
            >
              {booking.status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Booking ID</p>
                <p className="mt-1 font-mono text-sm font-semibold">{booking.id}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Total Amount</p>
                <p className="mt-1 text-sm font-bold" style={{ color: "var(--primary)" }}>
                  ₹{((booking.amount ?? 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Check-in</p>
                <p className="mt-1 text-sm font-semibold">{checkIn.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>From 2:00 PM</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Check-out</p>
                <p className="mt-1 text-sm font-semibold">{checkOut.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Before 11:00 AM</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Duration</p>
                <p className="mt-1 text-sm font-semibold">{nights} night{nights > 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Guests</p>
                <p className="mt-1 text-sm font-semibold">{(booking.metadata?.guests as number) ?? 1}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {booking.guestDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] border p-6 mb-6"
            style={{
              backgroundColor: "rgba(245,241,232,0.92)",
              borderColor: "rgba(74,101,68,0.18)",
            }}
          >
            <h2 className="font-display text-lg font-bold mb-4">Guest Information</h2>
            <div className="space-y-2 text-sm">
              <p><span style={{ color: "var(--muted)" }}>Name:</span> {booking.guestDetails.firstName} {booking.guestDetails.lastName}</p>
              <p><span style={{ color: "var(--muted)" }}>Email:</span> {booking.guestDetails.email}</p>
              <p><span style={{ color: "var(--muted)" }}>Phone:</span> {booking.guestDetails.phone}</p>
              {booking.guestDetails.specialRequests && (
                <p><span style={{ color: "var(--muted)" }}>Special Requests:</span> {booking.guestDetails.specialRequests}</p>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[2rem] border p-6 mb-6"
          style={{
            backgroundColor: "rgba(245,241,232,0.92)",
            borderColor: "rgba(74,101,68,0.18)",
          }}
        >
          <h2 className="font-display text-lg font-bold mb-4">Invoice</h2>
          <div className="flex items-center gap-4">
            <svg className="w-8 h-8" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold">Download Invoice</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Your receipt for this booking</p>
            </div>
            <a
              href={`/api/invoices/INV-${booking.id.slice(0, 8).toUpperCase()}`}
              target="_blank"
              className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:opacity-80"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Download
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[2rem] border p-6 mb-6"
          style={{
            backgroundColor: "rgba(245,241,232,0.92)",
            borderColor: "rgba(74,101,68,0.18)",
          }}
        >
          <h2 className="font-display text-lg font-bold mb-4">Add to Calendar</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={addCalendarLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] text-center rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-80"
              style={{ backgroundColor: "rgba(74,101,68,0.1)", color: "var(--primary)" }}
            >
              Google Calendar
            </a>
            <a
              href={addCalendarLinks.apple}
              download="trayati-booking.ics"
              className="flex-1 min-w-[140px] text-center rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-80"
              style={{ backgroundColor: "rgba(74,101,68,0.1)", color: "var(--primary)" }}
            >
              Apple Calendar
            </a>
          </div>
        </motion.div>

        {/* Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-[2rem] border p-6 mb-6"
          style={{
            backgroundColor: "rgba(245,241,232,0.92)",
            borderColor: "rgba(74,101,68,0.18)",
          }}
        >
          <h2 className="font-display text-lg font-bold mb-4">Share Your Experience</h2>
          
          {reviewSubmitted || existingReview ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill={star <= (existingReview?.rating ?? 5) ? "#f59e0b" : "none"}
                    stroke="#f59e0b"
                    strokeWidth={2}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="font-semibold" style={{ color: "var(--primary)" }}>Thank you for your review!</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Your feedback helps other travelers.</p>
            </div>
          ) : showReviewForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Overall Rating *
                </label>
                <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((prev) => ({ ...prev, rating: v }))} />
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Cleanliness
                  </label>
                  <StarRating value={reviewForm.cleanlinessRating} onChange={(v) => setReviewForm((prev) => ({ ...prev, cleanlinessRating: v }))} size={20} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Location
                  </label>
                  <StarRating value={reviewForm.locationRating} onChange={(v) => setReviewForm((prev) => ({ ...prev, locationRating: v }))} size={20} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Value
                  </label>
                  <StarRating value={reviewForm.valueRating} onChange={(v) => setReviewForm((prev) => ({ ...prev, valueRating: v }))} size={20} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm"
                  style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell others about your stay..."
                  rows={4}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm resize-none"
                  style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 rounded-full border py-2.5 text-sm font-bold uppercase tracking-wider transition hover:bg-[rgba(74,101,68,0.05)]"
                  style={{ borderColor: "rgba(74,101,68,0.2)", color: "var(--primary)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={reviewForm.rating === 0 || submittingReview}
                  className="flex-1 rounded-full py-2.5 text-sm font-bold uppercase tracking-wider text-white transition disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>How was your stay? Share your experience with other travelers.</p>
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:scale-[1.01]"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Write a Review
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border p-4 mb-8"
          style={{ backgroundColor: "rgba(74,101,68,0.04)", borderColor: "rgba(74,101,68,0.1)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            <strong>Note:</strong> A confirmation email has been sent to {booking.guestDetails?.email ?? "your email address"}. 
            Please check your inbox (and spam folder) for booking details and instructions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/"
            className="flex-1 text-center rounded-full py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:scale-[1.01]"
            style={{ backgroundColor: "var(--primary)", boxShadow: "0 8px 24px rgba(74,101,68,0.3)" }}
          >
            Back to Home
          </Link>
          <Link
            href="/booking"
            className="flex-1 text-center rounded-full border py-3 text-sm font-bold uppercase tracking-[0.15em] transition hover:bg-[rgba(74,101,68,0.05)]"
            style={{ borderColor: "rgba(74,101,68,0.2)", color: "var(--primary)" }}
          >
            Book Another Stay
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--primary)" }} />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
