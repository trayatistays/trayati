"use client";

import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FeaturedStay } from "@/data/featured-stays";
import { BookingCalendar, getCurrentMonth, getNextMonth, nightsBetween, rangeContainsUnavailable } from "@/components/booking-calendar";
import { toIsoDate } from "@/lib/booking/date";
import type { AvailabilityResponse, BookingLock } from "@/lib/booking/types";
import { calculatePricing, DEFAULT_PRICING_CONFIG, type PricingBreakdown } from "@/lib/pricing";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const SESSION_STORAGE_KEY = "trayati_booking_session_id";

type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

type PromoCodeState = {
  code: string;
  isValid: boolean | null;
  isLoading: boolean;
  discountAmount: number;
  error: string | null;
  promoCodeId: string | null;
};

async function ensureRazorpayScript() {
  if (window.Razorpay) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function BookingCheckoutCard({
  stay,
  roomId,
}: {
  stay: FeaturedStay;
  roomId: string | null;
}) {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { isSignedIn, user } = useUser();
  const today = toIsoDate(new Date());
  const initialMonth = getCurrentMonth();

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [availabilityByMonth, setAvailabilityByMonth] = useState<Record<string, AvailabilityResponse>>({});
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [lock, setLock] = useState<BookingLock | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [step, setStep] = useState<"dates" | "details" | "payment">("dates");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const sessionIdRef = useRef("");

  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: "",
    lastName: "",
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    phone: "",
    specialRequests: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<GuestDetails>>({});

  const [promoCode, setPromoCode] = useState<PromoCodeState>({
    code: "",
    isValid: null,
    isLoading: false,
    discountAmount: 0,
    error: null,
    promoCodeId: null,
  });

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      setGuestDetails((prev) => ({
        ...prev,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName ?? prev.firstName,
        lastName: user.lastName ?? prev.lastName,
      }));
    }
  }, [user]);

  useEffect(() => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setLock(null);
    setMessage(null);
    setStep("dates");
    setPromoCode({
      code: "",
      isValid: null,
      isLoading: false,
      discountAmount: 0,
      error: null,
      promoCodeId: null,
    });
  }, [stay.id, roomId]);

  useEffect(() => {
    const months = [currentMonth, getNextMonth(currentMonth)];
    for (const month of months) {
      if (availabilityByMonth[month]) {
        continue;
      }

      void fetch(`/api/calendar-availability?stayId=${encodeURIComponent(stay.id)}&roomId=${encodeURIComponent(roomId ?? "")}&month=${month}`)
        .then((response) => response.json())
        .then((data: AvailabilityResponse) => {
          setAvailabilityByMonth((current) => ({ ...current, [month]: data }));
        })
        .catch(() => {
          setMessage("Unable to load live availability right now.");
        });
    }
  }, [availabilityByMonth, currentMonth, roomId, stay.id]);

  const unavailableDates = useMemo(() => {
    const combined = new Set<string>();
    Object.values(availabilityByMonth).forEach((availability) => {
      availability.unavailableDates.forEach((date) => combined.add(date));
    });
    return combined;
  }, [availabilityByMonth]);

  const selectedRoom = roomId ? stay?.roomTypes?.find((room) => room.id === roomId) ?? null : null;
  const nightlyRate = selectedRoom?.pricePerNight ?? stay.pricePerNight;
  const maxGuests = selectedRoom?.maxOccupancy ?? 20;
  const totalNights = nightsBetween(selectedStartDate, selectedEndDate);
  const basePricing = useMemo(() => calculatePricing(nightlyRate, totalNights, guests, stay.pricingConfig), [nightlyRate, totalNights, guests, stay.pricingConfig]);

  const finalPricing: PricingBreakdown = useMemo(() => {
    const discount = promoCode.isValid ? promoCode.discountAmount : 0;
    return {
      ...basePricing,
      discountAmount: discount,
      total: Math.max(0, basePricing.total - discount),
    };
  }, [basePricing, promoCode.isValid, promoCode.discountAmount]);

  async function validatePromoCode() {
    if (!promoCode.code.trim()) {
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      setPromoCode((prev) => ({ ...prev, error: "Select dates first to apply promo code." }));
      return;
    }

    setPromoCode((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.code,
          stayId: stay.id,
          bookingAmount: basePricing.total,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setPromoCode((prev) => ({
          ...prev,
          isLoading: false,
          isValid: false,
          error: data.error ?? "Invalid promo code.",
          discountAmount: 0,
          promoCodeId: null,
        }));
        return;
      }

      setPromoCode((prev) => ({
        ...prev,
        isLoading: false,
        isValid: true,
        error: null,
        discountAmount: data.discountAmount,
        promoCodeId: data.promoCode?.id ?? null,
      }));
    } catch (error) {
      setPromoCode((prev) => ({
        ...prev,
        isLoading: false,
        isValid: false,
        error: "Failed to validate promo code.",
        discountAmount: 0,
        promoCodeId: null,
      }));
    }
  }

  function validateGuestDetails(): boolean {
    const errors: Partial<GuestDetails> = {};
    
    if (!guestDetails.firstName.trim()) errors.firstName = "First name is required";
    if (!guestDetails.lastName.trim()) errors.lastName = "Last name is required";
    if (!guestDetails.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) errors.email = "Invalid email format";
    if (!guestDetails.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(guestDetails.phone.replace(/\D/g, ""))) errors.phone = "Invalid Indian phone number";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function releaseCurrentLock() {
    if (!lock) {
      return;
    }

    const currentLockId = lock.id;
    setLock(null);
    await fetch("/api/release-lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lockId: currentLockId, sessionId: sessionIdRef.current }),
    }).catch(() => undefined);
  }

  async function createLockForRange(startDate: string, endDate: string) {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
    }

    setIsBusy(true);
    setMessage("Checking live availability...");

    try {
      const response = await fetch("/api/create-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayId: stay.id,
          roomId,
          startDate,
          endDate,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        lock?: BookingLock;
      };

      if (!response.ok || !data.lock) {
        throw new Error(data.error ?? "Those dates just became unavailable.");
      }

      setLock(data.lock);
      setMessage(null);
      setAvailabilityByMonth({});
    } catch (error) {
      setSelectedEndDate(null);
      setLock(null);
      setMessage(error instanceof Error ? error.message : "Unable to hold selected dates.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSelectDate(date: string) {
    if (date < today || unavailableDates.has(date)) {
      return;
    }

    if (!selectedStartDate || selectedEndDate) {
      await releaseCurrentLock();
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setMessage("Select your check-out date.");
      return;
    }

    if (date <= selectedStartDate) {
      await releaseCurrentLock();
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setMessage("Select your check-out date.");
      return;
    }

    if (rangeContainsUnavailable(selectedStartDate, date, unavailableDates)) {
      setMessage("This range crosses unavailable nights. Please choose different dates.");
      return;
    }

    await releaseCurrentLock();
    setSelectedEndDate(date);
    await createLockForRange(selectedStartDate, date);
  }

  function handleContinueToDetails() {
    if (!selectedStartDate || !selectedEndDate || !lock) {
      setMessage("Please select valid dates first.");
      return;
    }
    setStep("details");
    setMessage(null);
  }

  function handleBackToDates() {
    setStep("dates");
    setMessage(null);
  }

  async function handleContinueToPayment() {
    if (!validateGuestDetails()) {
      return;
    }

    setStep("payment");
    setMessage(null);
  }

  async function handleCheckout() {
    if (!selectedStartDate || !selectedEndDate || !lock) {
      setMessage("Select both check-in and check-out dates first.");
      return;
    }

    if (!validateGuestDetails()) {
      setStep("details");
      return;
    }

    setIsBusy(true);
    setMessage("Creating your booking...");

    try {
      const bookingResponse = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayId: stay.id,
          roomId,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          guests,
          lockId: lock.id,
          sessionId: sessionIdRef.current,
          guestDetails: {
            firstName: guestDetails.firstName,
            lastName: guestDetails.lastName,
            email: guestDetails.email,
            phone: guestDetails.phone,
            specialRequests: guestDetails.specialRequests,
          },
          promoCodeId: promoCode.promoCodeId,
          discountAmount: promoCode.discountAmount,
        }),
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(bookingData.error ?? "Unable to create booking.");
      }

      setBookingId(bookingData.booking.id);

      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          sessionId: sessionIdRef.current,
          amount: finalPricing.total,
          promoCodeId: promoCode.promoCodeId,
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.error ?? "Unable to create payment order.");
      }

      await ensureRazorpayScript();

      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const razorpay = new RazorpayCheckout({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Trayati Stays",
        description: `${stay.title} - ${totalNights} night${totalNights > 1 ? "s" : ""}`,
        prefill: {
          name: `${guestDetails.firstName} ${guestDetails.lastName}`,
          email: guestDetails.email,
          contact: guestDetails.phone,
        },
        theme: {
          color: "#4a6544",
        },
        handler: async (response: Record<string, string>) => {
          setMessage("Payment received. Verifying confirmation...");
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok) {
            throw new Error(verifyData.error ?? "Payment verification failed.");
          }

          router.push(`/booking/confirmation?bookingId=${bookingData.booking.id}`);
        },
      });

      razorpay.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div
      className="rounded-[2rem] p-5 sm:p-6 space-y-5"
      style={{
        backgroundColor: "rgba(245,241,232,0.92)",
        border: "1px solid rgba(74,101,68,0.18)",
        boxShadow: "0 10px 40px rgba(32,60,76,0.08)",
      }}
    >
      {/* Progress Steps */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em]">
        {["dates", "details", "payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem]"
              style={{
                backgroundColor: step === s || (i < ["dates", "details", "payment"].indexOf(step)) ? "var(--primary)" : "rgba(74,101,68,0.15)",
                color: step === s || (i < ["dates", "details", "payment"].indexOf(step)) ? "white" : "var(--muted)",
              }}
            >
              {i + 1}
            </div>
            <span style={{ color: step === s ? "var(--primary)" : "var(--muted)" }}>{s}</span>
            {i < 2 && <div className="w-8 h-px" style={{ backgroundColor: "rgba(74,101,68,0.2)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Date Selection */}
      {step === "dates" && (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Live Availability
              </p>
              <h3 className="font-display text-2xl font-bold tracking-[-0.03em]">
                Select dates
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                From
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                ₹{nightlyRate.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Check-in</p>
              <p className="mt-1 text-sm font-semibold">{selectedStartDate ?? "Select date"}</p>
            </div>
            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Check-out</p>
              <p className="mt-1 text-sm font-semibold">{selectedEndDate ?? "Select date"}</p>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <BookingCalendar
              month={currentMonth}
              unavailableDates={unavailableDates}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              onSelect={(date) => void handleSelectDate(date)}
              minimumDate={today}
            />
            <BookingCalendar
              month={getNextMonth(currentMonth)}
              unavailableDates={unavailableDates}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              onSelect={(date) => void handleSelectDate(date)}
              minimumDate={today}
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentMonth((month) => {
                const [year, monthIndex] = month.split("-").map(Number);
                return monthIndex === 1 ? `${year - 1}-12` : `${year}-${String(monthIndex - 1).padStart(2, "0")}`;
              })}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--primary)", backgroundColor: "rgba(74,101,68,0.08)" }}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--primary)", backgroundColor: "rgba(74,101,68,0.08)" }}
            >
              Next
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Guests
              </span>
              <input
                type="number"
                min="1"
                max={maxGuests}
                value={guests}
                onChange={(event) => setGuests(Math.min(maxGuests, Math.max(1, Number(event.target.value) || 1)))}
                className="w-full rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "rgba(74,101,68,0.14)",
                  backgroundColor: "rgba(255,255,255,0.72)",
                }}
              />
            </label>

            <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Estimated total</p>
              <p className="mt-1 text-lg font-bold" style={{ color: "var(--primary)" }}>
                {totalNights > 0 ? `₹${basePricing.total.toLocaleString()}` : "Select dates"}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {totalNights > 0 ? `${totalNights} night${totalNights > 1 ? "s" : ""} incl. taxes` : "Select dates to see price"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!lock || isBusy}
            onClick={handleContinueToDetails}
            className="w-full rounded-full py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01] disabled:opacity-50"
            style={{
              backgroundColor: "var(--button-primary)",
              boxShadow: "0 8px 24px rgba(74,101,68,0.3)",
            }}
          >
            {isBusy ? "Processing..." : "Continue to Guest Details"}
          </button>

          <div className="space-y-1 text-xs" style={{ color: "var(--muted)" }}>
            <p>Dates from iCal feeds, confirmed bookings, and active payment holds are blocked automatically.</p>
            <p>Your selection is held for 10 minutes once both dates are chosen.</p>
          </div>
        </>
      )}

      {/* Step 2: Guest Details */}
      {step === "details" && (
        <>
          <div>
            <h3 className="font-display text-xl font-bold tracking-[-0.03em] mb-1">Guest Details</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Enter your contact information for this booking.</p>
          </div>

          {/* Booking Summary */}
          <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--primary)" }}>{stay.title}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span style={{ color: "var(--muted)" }}>Check-in:</span> <span className="font-semibold">{selectedStartDate}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Check-out:</span> <span className="font-semibold">{selectedEndDate}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Nights:</span> <span className="font-semibold">{totalNights}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Guests:</span> <span className="font-semibold">{guests}</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                  First Name *
                </span>
                <input
                  type="text"
                  value={guestDetails.firstName}
                  onChange={(e) => setGuestDetails((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm"
                  style={{ borderColor: formErrors.firstName ? "#dc2626" : "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                  placeholder="John"
                />
                {formErrors.firstName && <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>}
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                  Last Name *
                </span>
                <input
                  type="text"
                  value={guestDetails.lastName}
                  onChange={(e) => setGuestDetails((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm"
                  style={{ borderColor: formErrors.lastName ? "#dc2626" : "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                  placeholder="Doe"
                />
                {formErrors.lastName && <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>}
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Email *
              </span>
              <input
                type="email"
                value={guestDetails.email}
                onChange={(e) => setGuestDetails((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2.5 text-sm"
                style={{ borderColor: formErrors.email ? "#dc2626" : "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                placeholder="john@example.com"
              />
              {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
            </label>

            <label className="block">
              <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Phone Number *
              </span>
              <input
                type="tel"
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2.5 text-sm"
                style={{ borderColor: formErrors.phone ? "#dc2626" : "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                placeholder="9876543210"
              />
              {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
            </label>

            <label className="block">
              <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Special Requests (Optional)
              </span>
              <textarea
                value={guestDetails.specialRequests}
                onChange={(e) => setGuestDetails((prev) => ({ ...prev, specialRequests: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border px-4 py-2.5 text-sm resize-none"
                style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}
                placeholder="Any special requests or requirements..."
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBackToDates}
              className="flex-1 rounded-full border py-3 text-sm font-bold uppercase tracking-[0.18em] transition hover:bg-[rgba(74,101,68,0.05)]"
              style={{ borderColor: "rgba(74,101,68,0.2)", color: "var(--primary)" }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinueToPayment}
              className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01]"
              style={{ backgroundColor: "var(--button-primary)", boxShadow: "0 8px 24px rgba(74,101,68,0.3)" }}
            >
              Continue to Payment
            </button>
          </div>
        </>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && (
        <>
          <div>
            <h3 className="font-display text-xl font-bold tracking-[-0.03em] mb-1">Review & Pay</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Review your booking details before payment.</p>
          </div>

          {/* Booking Details */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
            <p className="font-bold text-sm" style={{ color: "var(--primary)" }}>{stay.title}</p>
            {selectedRoom && <p className="text-xs" style={{ color: "var(--muted)" }}>Room: {selectedRoom.name}</p>}
            
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t" style={{ borderColor: "rgba(74,101,68,0.1)" }}>
              <div><span style={{ color: "var(--muted)" }}>Check-in:</span> <span className="font-semibold">{selectedStartDate}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Check-out:</span> <span className="font-semibold">{selectedEndDate}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Guests:</span> <span className="font-semibold">{guests}</span></div>
              <div><span style={{ color: "var(--muted)" }}>Nights:</span> <span className="font-semibold">{totalNights}</span></div>
            </div>

            <div className="text-xs pt-2 border-t" style={{ borderColor: "rgba(74,101,68,0.1)" }}>
              <p className="font-semibold">{guestDetails.firstName} {guestDetails.lastName}</p>
              <p style={{ color: "var(--muted)" }}>{guestDetails.email}</p>
              <p style={{ color: "var(--muted)" }}>{guestDetails.phone}</p>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Promo Code</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode.code}
                onChange={(e) => setPromoCode((prev) => ({ ...prev, code: e.target.value.toUpperCase(), isValid: null, error: null }))}
                placeholder="Enter promo code"
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm uppercase"
                style={{ borderColor: promoCode.isValid ? "var(--primary)" : promoCode.error ? "#dc2626" : "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.9)" }}
                disabled={promoCode.isValid === true}
              />
              <button
                type="button"
                onClick={validatePromoCode}
                disabled={promoCode.isLoading || promoCode.isValid === true || !promoCode.code.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-white transition disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {promoCode.isLoading ? "..." : promoCode.isValid ? "Applied" : "Apply"}
              </button>
            </div>
            {promoCode.isValid && (
              <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                ✓ Promo code applied! You save ₹{promoCode.discountAmount.toLocaleString()}
              </p>
            )}
            {promoCode.error && (
              <p className="text-xs text-red-600">{promoCode.error}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: "rgba(74,101,68,0.14)", backgroundColor: "rgba(255,255,255,0.72)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--muted)" }}>Price Breakdown</p>
            
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--foreground-soft)" }}>₹{nightlyRate.toLocaleString()} × {totalNights} nights</span>
                <span>₹{basePricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--foreground-soft)" }}>Cleaning fee</span>
                <span>₹{basePricing.cleaningFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--foreground-soft)" }}>Service fee</span>
                <span>₹{basePricing.serviceFee.toLocaleString()}</span>
              </div>
              {basePricing.extraGuestFee > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--foreground-soft)" }}>Extra guest fee</span>
                  <span>₹{basePricing.extraGuestFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: "var(--foreground-soft)" }}>GST ({stay.pricingConfig?.gstPercentage ?? 18}%)</span>
                <span>₹{basePricing.gstAmount.toLocaleString()}</span>
              </div>
              {promoCode.isValid && promoCode.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-₹{promoCode.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2 border-t font-bold" style={{ borderColor: "rgba(74,101,68,0.1)" }}>
              <span>Total</span>
              <span style={{ color: "var(--primary)" }}>₹{finalPricing.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="rounded-xl border p-3 text-xs" style={{ borderColor: "rgba(74,101,68,0.1)", backgroundColor: "rgba(74,101,68,0.04)" }}>
            <p className="font-bold mb-1">Cancellation Policy</p>
            <p style={{ color: "var(--muted)" }}>Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="flex-1 rounded-full border py-3 text-sm font-bold uppercase tracking-[0.18em] transition hover:bg-[rgba(74,101,68,0.05)]"
              style={{ borderColor: "rgba(74,101,68,0.2)", color: "var(--primary)" }}
            >
              Back
            </button>
            
            {!isLoaded ? (
              <button
                type="button"
                disabled
                className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.18em] text-white opacity-70"
                style={{ backgroundColor: "var(--button-primary)" }}
              >
                Loading...
              </button>
            ) : isSignedIn ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleCheckout()}
                className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01] disabled:opacity-70"
                style={{ backgroundColor: "var(--button-primary)", boxShadow: "0 8px 24px rgba(74,101,68,0.3)" }}
              >
                {isBusy ? "Processing..." : `Pay ₹${finalPricing.total.toLocaleString()}`}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:scale-[1.01]"
                  style={{ backgroundColor: "var(--button-primary)", boxShadow: "0 8px 24px rgba(74,101,68,0.3)" }}
                >
                  Sign In To Pay
                </button>
              </SignInButton>
            )}
          </div>
        </>
      )}

      {message && (
        <p className="text-sm" style={{ color: message.includes("confirmed") || message.includes("success") ? "var(--primary)" : message.includes("Error") || message.includes("failed") ? "#dc2626" : "var(--foreground-soft)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
