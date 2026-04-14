"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { BookingFilterForm } from "@/components/booking-filter-form";
import { BookingResults } from "@/components/booking-results";
import { ReserveNowButton } from "@/components/reserve-now-button";
import { useStays } from "@/hooks/use-stays";
import type { ExperienceType } from "@/data/experience-types";

type FilterState = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  category: string;
  experienceType: ExperienceType | "";
};

function BookingContent() {
  const searchParams = useSearchParams();
  const stayId = searchParams.get("stayId");
  const experience = (searchParams.get("experience") ?? "") as ExperienceType | "";
  const { stays, isLoading, error } = useStays();
  const selectedStay = stayId ? stays.find((s) => s.id === stayId) : null;

  const [baseFilters, setBaseFilters] = useState<Omit<FilterState, "experienceType">>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    category: "couple",
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    selectedStay && selectedStay.roomTypes.length === 1 
      ? selectedStay.roomTypes[0].id 
      : null
  );

  const filters: FilterState = {
    ...baseFilters,
    experienceType: experience,
  };

  const filteredCount = stays.filter((stay) => {
    if (
      filters.location &&
      !`${stay.city} ${stay.state} ${stay.country}`
        .toLowerCase()
        .includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.experienceType && stay.experienceType !== filters.experienceType) {
      return false;
    }
    return true;
  }).length;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,233,0.95)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              ← Back
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-[-0.03em]">
              Find Your Stay
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Hero background gradient */}
      <div className="absolute inset-0 pointer-events-none h-96">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "rgba(13,58,82,0.3)" }}
        />
        <div
          className="absolute top-32 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: "rgba(164,108,43,0.2)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* 3D decorative cards background */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {stayId && isLoading ? (
            <p style={{ color: "var(--muted)" }}>Loading property details...</p>
          ) : stayId && error ? (
            <p className="text-red-600">{error}</p>
          ) : stayId && !selectedStay ? (
            <p style={{ color: "var(--muted)" }}>That property could not be found.</p>
          ) : null}

          {selectedStay ? (
            // Show selected property details
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70 mb-6"
                  style={{ color: "var(--primary)" }}
                >
                  ← Back to Properties
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Property details */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <span
                      className="inline-block rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white mb-4"
                      style={{
                        backgroundColor: "var(--cta)",
                      }}
                    >
                      {selectedStay.tag}
                    </span>
                    <h2 className="font-display text-4xl font-bold tracking-[-0.03em] mb-2">
                      {selectedStay.title}
                    </h2>
                    <p style={{ color: "var(--muted)" }} className="text-base">
                      {selectedStay.city}, {selectedStay.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className="rounded-full px-4 py-2 text-sm font-bold"
                      style={{ backgroundColor: "rgba(74,101,68,0.15)", color: "var(--primary)" }}
                    >
                      ★ {selectedStay.rating.toFixed(1)}
                    </span>
                    <span
                      className="rounded-full px-4 py-2 text-sm font-bold"
                      style={{ backgroundColor: "rgba(164,108,43,0.15)", color: "var(--cta)" }}
                    >
                      ₹{selectedStay.pricePerNight.toLocaleString()}/night
                    </span>
                  </div>

                  <p className="text-base leading-relaxed prose-invert">
                    {selectedStay.description}
                  </p>

                  <div>
                    <h3 className="font-display text-lg font-bold mb-4">Location</h3>
                    <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>
                      {selectedStay.address}
                    </p>
                    <p className="text-sm mt-2" style={{ color: "var(--foreground-soft)" }}>
                      {selectedStay.city}, {selectedStay.state} {selectedStay.pin}
                    </p>
                    {selectedStay.googleMapsUrl && (
                      <Link
                        href={selectedStay.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-sm font-semibold transition hover:opacity-70"
                        style={{ color: "var(--primary)" }}
                      >
                        View on Google Maps ↗
                      </Link>
                    )}
                  </div>

                  {/* Available Rooms Section */}
                  {selectedStay.roomTypes.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-bold mb-4">Available Rooms</h3>
                      <div className="space-y-3">
                        {selectedStay.roomTypes.map((room) => (
                          <motion.div
                            key={room.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedRoomId(room.id)}
                            className="p-4 rounded-lg border cursor-pointer transition"
                            style={{
                              borderColor:
                                selectedRoomId === room.id
                                  ? "var(--primary)"
                                  : "rgba(74,101,68,0.2)",
                              backgroundColor:
                                selectedRoomId === room.id
                                  ? "rgba(74,101,68,0.1)"
                                  : "rgba(245,241,233,0.6)",
                              boxShadow:
                                selectedRoomId === room.id
                                  ? "0 4px 20px rgba(74,101,68,0.15)"
                                  : "none",
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-sm">{room.name}</h4>
                                <p style={{ color: "var(--muted)" }} className="text-xs">
                                  {room.category}
                                </p>
                              </div>
                              <span
                                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                                style={{
                                  backgroundColor: "var(--cta)",
                                }}
                              >
                                ₹{room.pricePerNight.toLocaleString()}/night
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span style={{ color: "var(--muted)" }}>Bed Configuration:</span>
                                <p className="font-semibold mt-1">{room.bedConfiguration}</p>
                              </div>
                              <div>
                                <span style={{ color: "var(--muted)" }}>Bathroom:</span>
                                <p className="font-semibold mt-1">{room.bathroom}</p>
                              </div>
                              <div>
                                <span style={{ color: "var(--muted)" }}>Max Occupancy:</span>
                                <p className="font-semibold mt-1">{room.maxOccupancy} guests</p>
                              </div>
                              <div>
                                <span style={{ color: "var(--muted)" }}>Available Units:</span>
                                <p className="font-semibold mt-1">{room.units} unit{room.units > 1 ? "s" : ""}</p>
                              </div>
                            </div>

                            {room.extraBedOption && (
                              <p style={{ color: "var(--muted)" }} className="text-xs mt-3">
                                ✓ {room.extraBedOption}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking widget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:sticky lg:top-24 h-fit"
                >
                  <div
                    className="rounded-2xl p-6 space-y-6"
                    style={{
                      backgroundColor: "rgba(245,241,232,0.9)",
                        border: "1px solid rgba(74,101,68,0.2)",
                      boxShadow: "0 10px 40px rgba(32,60,76,0.08)",
                    }}
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-70">
                        Check-in
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: "rgba(74,101,68,0.2)",
                          backgroundColor: "rgba(255,255,255,0.6)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-70">
                        Check-out
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: "rgba(74,101,68,0.2)",
                          backgroundColor: "rgba(255,255,255,0.6)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-70">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-full px-4 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: "rgba(74,101,68,0.2)",
                          backgroundColor: "rgba(255,255,255,0.6)",
                        }}
                      />
                    </div>

                    {/* Selected Room Summary */}
                    {selectedRoomId && selectedStay?.roomTypes && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg"
                         style={{
                           backgroundColor: "rgba(74,101,68,0.1)",
                           border: "1px solid rgba(74,101,68,0.3)",
                         }}
                      >
                        {(() => {
                          const selectedRoom = selectedStay.roomTypes.find(
                            (room) => room.id === selectedRoomId
                          );
                          return selectedRoom ? (
                            <div className="space-y-2">
                              <p className="text-xs opacity-70">
                                <span className="font-semibold">Room Selected:</span> {selectedRoom.name}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs opacity-70">Price per night:</span>
                                <span
                                  className="font-bold text-sm"
                                  style={{ color: "var(--primary)" }}
                                >
                                  ₹{selectedRoom.pricePerNight.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs opacity-70">
                                Max {selectedRoom.maxOccupancy} guests • {selectedRoom.bedConfiguration}
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </motion.div>
                    )}

                    <ReserveNowButton
                      stayId={selectedStay.id}
                      roomId={selectedRoomId}
                      className="w-full rounded-full bg-[var(--button-primary)] py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 hover:bg-[var(--button-primary-hover)]"
                      style={{
                        boxShadow: "0 8px 24px rgba(74,101,68,0.3)",
                      }}
                    />

                    <p style={{ color: "var(--muted)" }} className="text-xs text-center">
                      Final price will be confirmed after dates are selected&apos;
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          ) : !stayId ? (
            // Show all properties listing
            <>
              {/* Filter Form */}
              <BookingFilterForm
                key={experience || "all-experiences"}
                filters={filters}
                onFilter={(nextFilters) => {
                  setBaseFilters({
                    location: nextFilters.location,
                    checkIn: nextFilters.checkIn,
                    checkOut: nextFilters.checkOut,
                    guests: nextFilters.guests,
                    category: nextFilters.category,
                  });
                }}
              />

              {/* Results Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold tracking-[-0.03em] mb-2">
                    Available Properties
                  </h2>
                  <p style={{ color: "var(--muted)" }} className="text-sm">
                    Showing {filteredCount} properties
                    {filters.experienceType && ` for ${filters.experienceType}`}
                    {filters.location && ` in ${filters.location}`}
                  </p>
                </div>
                <BookingResults filters={filters} />
              </motion.div>
            </>
          ) : null}
        </motion.div>
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-20 py-12 text-center border-t"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,233,0.5)",
        }}
      >
        <p className="font-display text-xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</p>
        <p style={{ color: "var(--muted)" }} className="mb-6">
          Contact our team for personalized recommendations
        </p>
        <Link
          href="/contact"
          className="inline-block rounded-full bg-[var(--button-primary)] px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--button-primary-hover)]"
          style={{
            boxShadow: "0 12px 30px rgba(74,101,68,0.35)",
          }}
        >
          Contact Us
        </Link>
      </motion.div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "var(--primary)" }}></div>
          <p className="mt-4" style={{ color: "var(--muted)" }}>Loading...</p>
        </div>
      </main>
    }>
      <BookingContent />
    </Suspense>
  );
}
