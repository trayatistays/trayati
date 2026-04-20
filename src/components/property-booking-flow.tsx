"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeaturedStay } from "@/data/featured-stays";
import { useUser } from "@clerk/nextjs";

type BookingStep = "room" | "dates" | "guests" | "meals" | "review";

interface BookingState {
  roomId: string | null;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  mealOption: string | null;
  specialRequests: string;
}

interface PropertyBookingFlowProps {
  stay: FeaturedStay;
  onBookingComplete?: (booking: BookingState) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function PropertyBookingFlow({ stay, onBookingComplete }: PropertyBookingFlowProps) {
  const { isSignedIn } = useUser();
  const [step, setStep] = useState<BookingStep>("room");
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [booking, setBooking] = useState<BookingState>({
    roomId: stay.roomTypes.length === 1 ? stay.roomTypes[0].id : null,
    checkInDate: today,
    checkOutDate: tomorrow,
    guests: 1,
    mealOption:
      stay.mealOptions?.length > 0 ? (stay.mealOptions[0].id ?? null) : null,
    specialRequests: "",
  });

  const selectedRoom = useMemo(
    () => stay.roomTypes.find((r) => r.id === booking.roomId),
    [booking.roomId, stay.roomTypes]
  );

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  const selectedMeal = useMemo(
    () => stay.mealOptions?.find((m) => m.id === booking.mealOption),
    [booking.mealOption, stay.mealOptions]
  );

  const priceBreakdown = useMemo(() => {
    if (!selectedRoom) return null;

    const roomTotal = selectedRoom.pricePerNight * nights;
    const mealPrice = selectedMeal
      ? (selectedMeal.pricePerPerson || selectedMeal.price || 0)
      : 0;
    const mealTotal = mealPrice * booking.guests * nights;
    const subtotal = roomTotal + mealTotal;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    return {
      roomTotal,
      mealTotal,
      subtotal,
      gst,
      total,
    };
  }, [selectedRoom, nights, selectedMeal, booking.guests]);

  const handleRoomSelect = (roomId: string) => {
    setBooking((prev) => ({ ...prev, roomId }));
  };

  const handleDateChange = (type: "checkIn" | "checkOut", date: string) => {
    setBooking((prev) => {
      const updated = { ...prev, [type === "checkIn" ? "checkInDate" : "checkOutDate"]: date };
      if (type === "checkIn" && updated.checkOutDate <= date) {
        updated.checkOutDate = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      }
      return updated;
    });
  };

  const handleGuestsChange = (count: number) => {
    const maxGuests =
      selectedRoom?.maxOccupancy ||
      Math.max(...stay.roomTypes.map((r) => r.maxOccupancy)) ||
      10;
    setBooking((prev) => ({
      ...prev,
      guests: Math.max(1, Math.min(maxGuests, count)),
    }));
  };

  const handleMealChange = (mealId: string) => {
    setBooking((prev) => ({ ...prev, mealOption: mealId }));
  };

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case "room":
        return booking.roomId !== null;
      case "dates":
        return (
          !!booking.checkInDate &&
          !!booking.checkOutDate &&
          booking.checkOutDate > booking.checkInDate
        );
      case "guests":
        return booking.guests >= 1;
      case "meals":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  }, [step, booking]);

  const nextStep = () => {
    if (!canProceed()) return;
    const steps: BookingStep[] = ["room", "dates", "guests", "meals", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: BookingStep[] = ["room", "dates", "guests", "meals", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleConfirmBooking = () => {
    if (onBookingComplete) {
      onBookingComplete(booking);
    }
  };

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["room", "dates", "guests", "meals", "review"].map((s, idx) => (
            <div key={s} className="flex items-center">
              <motion.button
                onClick={() => {
                  const steps: BookingStep[] = ["room", "dates", "guests", "meals", "review"];
                  const currentIndex = steps.indexOf(step);
                  if (idx <= currentIndex) setStep(s as BookingStep);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full font-semibold transition"
                style={{
                  backgroundColor: idx <= ["room", "dates", "guests", "meals", "review"].indexOf(step)
                    ? "var(--primary)"
                    : "var(--border-soft)",
                  color: idx <= ["room", "dates", "guests", "meals", "review"].indexOf(step)
                    ? "white"
                    : "var(--muted)",
                }}
              >
                {idx + 1}
              </motion.button>
              {idx < 4 && (
                <div
                  className="mx-2 h-1 flex-1"
                  style={{
                    backgroundColor: idx < ["room", "dates", "guests", "meals", "review"].indexOf(step)
                      ? "var(--primary)"
                      : "var(--border-soft)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs font-medium" style={{ color: "var(--muted)" }}>
          <span>Room</span>
          <span>Dates</span>
          <span>Guests</span>
          <span>Meals</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === "room" && (
          <motion.div
            key="room"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Select Your Room</h3>
            <div className="grid gap-4">
              {stay.roomTypes.map((room) => (
                <motion.button
                  key={room.id}
                  onClick={() => handleRoomSelect(room.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-xl border-2 p-4 text-left transition"
                  style={{
                    borderColor: booking.roomId === room.id ? "var(--primary)" : "var(--border-soft)",
                    backgroundColor:
                      booking.roomId === room.id
                        ? "rgba(164,108,43,0.05)"
                        : "transparent",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold">{room.name}</h4>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>
                        {room.capacity} guests • {room.area} sq ft
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                        {formatPrice(room.pricePerNight)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>/night</p>
                    </div>
                  </div>
                  {booking.roomId === room.id && (
                    <motion.div
                      layoutId="selected"
                      className="absolute inset-0 rounded-xl border-2"
                      style={{ borderColor: "var(--primary)" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "dates" && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Select Your Dates</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-2">Check-In Date</label>
                <input
                  type="date"
                  value={booking.checkInDate}
                  onChange={(e) => handleDateChange("checkIn", e.target.value)}
                  min={today}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{ borderColor: "var(--border-soft)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Check-Out Date</label>
                <input
                  type="date"
                  value={booking.checkOutDate}
                  onChange={(e) => handleDateChange("checkOut", e.target.value)}
                  min={booking.checkInDate}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{ borderColor: "var(--border-soft)" }}
                />
              </div>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: "rgba(164,108,43,0.05)" }}
            >
              <p className="text-sm font-semibold">
                Total: <span style={{ color: "var(--primary)" }}>{nights} night{nights !== 1 ? "s" : ""}</span>
              </p>
            </div>
          </motion.div>
        )}

        {step === "guests" && (
          <motion.div
            key="guests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">How Many Guests?</h3>
            <div className="flex items-center justify-center gap-6">
              <motion.button
                onClick={() => handleGuestsChange(booking.guests - 1)}
                whileTap={{ scale: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-lg"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                −
              </motion.button>
              <div className="text-center">
                <p className="text-5xl font-bold">{booking.guests}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Guest{booking.guests !== 1 ? "s" : ""}
                </p>
              </div>
              <motion.button
                onClick={() => handleGuestsChange(booking.guests + 1)}
                whileTap={{ scale: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-lg"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                +
              </motion.button>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: "rgba(164,108,43,0.05)" }}
            >
              <p className="text-sm">
                <span className="font-semibold">Room capacity:</span> Up to {selectedRoom?.capacity} guests
              </p>
            </div>
          </motion.div>
        )}

        {step === "meals" && (
          <motion.div
            key="meals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Select Meal Plan</h3>
            <div className="space-y-3">
              {stay.mealOptions && stay.mealOptions.length > 0 ? (
                stay.mealOptions
                  .filter((meal) => meal.id) // Only render meals with IDs
                  .map((meal) => (
                    <motion.button
                      key={meal.id}
                      onClick={() => handleMealChange(meal.id!)} // meal.id is guaranteed after filter
                      whileHover={{ scale: 1.02 }}
                      className="w-full rounded-lg border-2 p-4 text-left transition"
                      style={{
                        borderColor: booking.mealOption === meal.id ? "var(--primary)" : "var(--border-soft)",
                        backgroundColor:
                          booking.mealOption === meal.id
                            ? "rgba(164,108,43,0.05)"
                            : "transparent",
                      }}
                    >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{meal.name}</p>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          {meal.description}
                        </p>
                      </div>
                      <p className="font-bold" style={{ color: "var(--primary)" }}>
                        {formatPrice(meal.pricePerPerson || meal.price || 0)}/person/night
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <p style={{ color: "var(--muted)" }}>No meal options available</p>
              )}
            </div>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold">Review Your Booking</h3>

            {/* Booking Summary */}
            <div
              className="rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "rgba(164,108,43,0.05)" }}
            >
              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  PROPERTY
                </p>
                <h4 className="text-lg font-bold">{stay.title}</h4>
                <p className="text-sm">{stay.location}</p>
              </div>

              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  ROOM SELECTED
                </p>
                <p className="font-bold">{selectedRoom?.name}</p>
              </div>

              <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  DATES & GUESTS
                </p>
                <p>
                  {new Date(booking.checkInDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  - {new Date(booking.checkOutDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  • {nights} night{nights !== 1 ? "s" : ""} • {booking.guests} guest
                  {booking.guests !== 1 ? "s" : ""}
                </p>
              </div>

              {selectedMeal && (
                <div className="border-b pb-4" style={{ borderColor: "var(--border-soft)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                    MEAL PLAN
                  </p>
                  <p className="font-bold">{selectedMeal.name}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  SPECIAL REQUESTS
                </p>
                <textarea
                  value={booking.specialRequests}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, specialRequests: e.target.value }))
                  }
                  placeholder="Add any special requests..."
                  className="mt-2 w-full rounded-lg border p-3 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                  rows={3}
                />
              </div>
            </div>

            {/* Price Breakdown */}
            {priceBreakdown && (
              <div
                className="rounded-xl p-6 space-y-3"
                style={{ backgroundColor: "rgba(164,108,43,0.05)" }}
              >
                <h4 className="font-bold">Price Breakdown</h4>
                <div className="space-y-2 border-b pb-3" style={{ borderColor: "var(--border-soft)" }}>
                  <div className="flex justify-between text-sm">
                    <span>
                      {selectedRoom?.name} × {nights} night{nights !== 1 ? "s" : ""}
                    </span>
                    <span>{formatPrice(priceBreakdown.roomTotal)}</span>
                  </div>
                  {priceBreakdown.mealTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>
                        {selectedMeal?.name} × {booking.guests} guest
                        {booking.guests !== 1 ? "s" : ""} × {nights} night
                        {nights !== 1 ? "s" : ""}
                      </span>
                      <span>{formatPrice(priceBreakdown.mealTotal)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(priceBreakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b pb-3" style={{ borderColor: "var(--border-soft)" }}>
                  <span>GST (18%)</span>
                  <span>{formatPrice(priceBreakdown.gst)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Price</span>
                  <span style={{ color: "var(--primary)" }}>
                    {formatPrice(priceBreakdown.total)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-3">
        {["room", "dates", "guests", "meals", "review"].indexOf(step) > 0 && (
          <motion.button
            onClick={prevStep}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 rounded-lg border-2 py-3 font-semibold transition"
            style={{
              borderColor: "var(--primary)",
              color: "var(--primary)",
            }}
          >
            Back
          </motion.button>
        )}
        <motion.button
          onClick={step === "review" ? handleConfirmBooking : nextStep}
          disabled={!canProceed()}
          whileHover={canProceed() ? { scale: 1.05 } : {}}
          whileTap={canProceed() ? { scale: 0.95 } : {}}
          className="flex-1 rounded-lg py-3 font-semibold text-white transition disabled:opacity-50"
          style={{
            backgroundColor: canProceed() ? "var(--primary)" : "var(--border-soft)",
          }}
        >
          {step === "review" ? "Confirm & Proceed to Payment" : "Next"}
        </motion.button>
      </div>

      {!isSignedIn && step === "review" && (
        <div
          className="mt-4 rounded-lg p-4 text-sm"
          style={{ backgroundColor: "rgba(164,108,43,0.1)" }}
        >
          <p style={{ color: "var(--foreground-soft)" }}>
            You will be prompted to sign in before completing your booking.
          </p>
        </div>
      )}
    </div>
  );
}
