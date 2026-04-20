"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowLeft, HiCheck, HiX } from "react-icons/hi";
import { experienceTypes, type ExperienceType } from "@/data/experience-types";

type RoomType = {
  name: string;
  category: string;
  units: string;
  bedConfiguration: string;
  bathroom: string;
  extraBedOption: string;
  pricePerNight: string;
  maxOccupancy: string;
};

type PropertyForm = {
  title: string;
  subtitle: string;
  city: string;
  state: string;
  country: string;
  pin: string;
  address: string;
  description: string;
  pricePerNight: string;
  googleMapsUrl: string;
  tag: string;
  type: string;
  experienceType: ExperienceType;
  amenities: string;
  photos: string[];
  roomTypes: RoomType[];
};

const initialRoomType: RoomType = {
  name: "",
  category: "Standard",
  units: "1",
  bedConfiguration: "",
  bathroom: "",
  extraBedOption: "",
  pricePerNight: "",
  maxOccupancy: "",
};

const propertyTypes = [
  "Private Villa",
  "Boutique Stay",
  "Heritage Property",
  "Beach Villa",
  "Mountain Cottage",
  "Farm House",
  "Apartment",
  "Guest House",
  "Homestay",
  "Resort",
];

const amenityOptions = [
  "WiFi",
  "Parking",
  "Kitchen",
  "AC",
  "Heater",
  "Geyser",
  "Washing Machine",
  "Fridge",
  "TV",
  "Power Backup",
  "Garden",
  "Balcony",
  "Bonfire",
  "Swimming Pool",
  "Spa",
  "Pet Friendly",
  "Wheelchair Accessible",
  "Caretaker",
  "Meals Available",
  "Airport Transfer",
];

export default function ListPropertyPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [mounted] = useState(() => {
    if (typeof window === "undefined") return false;
    return true;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([initialRoomType]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/list-property");
    }
  }, [isSignedIn, router]);

  const [form, setForm] = useState<PropertyForm>({
    title: "",
    subtitle: "Trayati Stays",
    city: "",
    state: "",
    country: "India",
    pin: "",
    address: "",
    description: "",
    pricePerNight: "",
    googleMapsUrl: "",
    tag: "New Listing",
    type: "Boutique Stay",
    experienceType: "Folklore Homestays",
    amenities: "",
    photos: [],
    roomTypes: [initialRoomType],
  });

  if (!mounted) {
    return null;
  }

  function updateField<K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }

  async function addPhotoUrl() {
    if (!newPhotoUrl.trim()) return;
    setPhotoUrls((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  }

  function removePhotoUrl(index: number) {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePhotoUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploadingPhoto(true);

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);

      try {
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await response.json()) as { url?: string; error?: string };

        if (data.url) {
          setPhotoUrls((prev) => [...prev, data.url!]);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploadingPhoto(false);
  }

  function addRoomType() {
    setRoomTypes((prev) => [...prev, { ...initialRoomType }]);
  }

  function updateRoomType(index: number, field: keyof RoomType, value: string) {
    setRoomTypes((prev) =>
      prev.map((room, i) => (i === index ? { ...room, [field]: value } : room))
    );
  }

  function removeRoomType(index: number) {
    setRoomTypes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const roomTypesParsed = roomTypes
      .filter((r) => r.name.trim())
      .map((r) => ({
        id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: r.name,
        category: r.category,
        units: parseInt(r.units) || 1,
        bedConfiguration: r.bedConfiguration,
        bathroom: r.bathroom,
        extraBedOption: r.extraBedOption || null,
        pricePerNight: parseInt(r.pricePerNight) || 0,
        maxOccupancy: parseInt(r.maxOccupancy) || 2,
      }));

    const submission = {
      clerkUserId: user?.id,
      userName: user?.fullName || user?.firstName || "Unknown",
      userEmail: user?.primaryEmailAddress?.emailAddress || "",
      property: {
        id: `submission-${Date.now()}`,
        title: form.title,
        subtitle: form.subtitle,
        location: `${form.city}, ${form.state}`,
        city: form.city,
        state: form.state,
        country: form.country,
        pin: form.pin,
        address: form.address,
        googleMapsUrl: form.googleMapsUrl,
        description: form.description,
        rating: 0,
        pricePerNight: parseInt(form.pricePerNight) || 0,
        basePrice: parseInt(form.pricePerNight) || 0,
        image: photoUrls[0] || "/trayati-logo.jpg",
        alt: `${form.title} - ${form.city}, ${form.state}`,
        tag: form.tag,
        type: form.type,
        experienceType: form.experienceType,
        amenities: selectedAmenities,
        photos: photoUrls.length ? photoUrls : ["/trayati-logo.jpg"],
        roomTypes: roomTypesParsed,
        amenitiesDetail: {
          parking: selectedAmenities.includes("Parking"),
          heaterOnRequest: selectedAmenities.includes("Heater"),
          tv: selectedAmenities.includes("TV"),
          fridge: selectedAmenities.includes("Fridge"),
          washingMachine: selectedAmenities.includes("Washing Machine"),
          powerBackup: selectedAmenities.includes("Power Backup"),
          airConditioning: selectedAmenities.includes("AC"),
          geyser: selectedAmenities.includes("Geyser"),
          kitchen: selectedAmenities.includes("Kitchen"),
          garden: selectedAmenities.includes("Garden"),
          balcony: selectedAmenities.includes("Balcony"),
          lounge: false,
          studyArea: false,
          fireplace: selectedAmenities.includes("Bonfire"),
          pool: selectedAmenities.includes("Swimming Pool"),
          spa: selectedAmenities.includes("Spa"),
        },
        mealOptions: [],
        cancellationPolicies: [
          {
            name: "Flexible",
            description: "Free cancellation until 7 days before check-in",
            refundPercentage: 100,
            daysBeforeCheckin: 7,
          },
        ],
      },
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/property-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (response.ok && data.success) {
        setShowSuccessModal(true);
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || "Failed to submit property");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: "var(--primary)" }}
          >
            <HiArrowLeft className="text-lg" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-2xl border p-6 shadow-lg"
            style={{
              backgroundColor: "rgba(245,241,233,0.88)",
              borderColor: "var(--border-soft)",
            }}
          >
            <h1 className="mb-2 font-display text-3xl font-bold" style={{ color: "var(--primary)" }}>
              List Your Property
            </h1>
            <p style={{ color: "var(--muted)" }}>
              Share your property with travelers across India. Our team will review and approve your listing within 48 hours.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border p-6 shadow-lg"
              style={{
                backgroundColor: "rgba(245,241,233,0.88)",
                borderColor: "var(--border-soft)",
              }}
            >
              <h2 className="mb-4 font-display text-xl font-bold" style={{ color: "var(--primary)" }}>
                Basic Information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Property Name *
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g., Mountain View Retreat"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Property Type *
                  </span>
                  <select
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Tag
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.tag}
                    onChange={(e) => updateField("tag", e.target.value)}
                    placeholder="e.g., Premium Stay"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Stay Experience *
                  </span>
                  <select
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.experienceType}
                    onChange={(e) => updateField("experienceType", e.target.value as ExperienceType)}
                  >
                    {experienceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Price Per Night (₹) *
                  </span>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.pricePerNight}
                    onChange={(e) => updateField("pricePerNight", e.target.value)}
                    placeholder="e.g., 5000"
                    required
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Description *
                  </span>
                  <textarea
                    className="min-h-32 w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Describe your property, its unique features, and why travelers will love it..."
                    required
                  />
                </label>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border p-6 shadow-lg"
              style={{
                backgroundColor: "rgba(245,241,233,0.88)",
                borderColor: "var(--border-soft)",
              }}
            >
              <h2 className="mb-4 font-display text-xl font-bold" style={{ color: "var(--primary)" }}>
                Location Details
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    City *
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="e.g., Mussoorie"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    State *
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="e.g., Uttarakhand"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Country
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="India"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Pin Code
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.pin}
                    onChange={(e) => updateField("pin", e.target.value)}
                    placeholder="e.g., 248179"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Full Address *
                  </span>
                  <textarea
                    className="min-h-20 w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Complete address of your property..."
                    required
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    Google Maps URL
                  </span>
                  <input
                    className="w-full rounded-lg border px-4 py-3"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={form.googleMapsUrl}
                    onChange={(e) => updateField("googleMapsUrl", e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </label>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl border p-6 shadow-lg"
              style={{
                backgroundColor: "rgba(245,241,233,0.88)",
                borderColor: "var(--border-soft)",
              }}
            >
              <h2 className="mb-4 font-display text-xl font-bold" style={{ color: "var(--primary)" }}>
                Amenities
              </h2>
              <div className="flex flex-wrap gap-3">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
                    style={{
                  borderColor: selectedAmenities.includes(amenity) ? "var(--cta)" : "var(--border-soft)",
                  backgroundColor: selectedAmenities.includes(amenity) ? "rgba(164,108,43,0.1)" : "transparent",
                      color: selectedAmenities.includes(amenity) ? "var(--cta)" : "var(--primary)",
                    }}
                  >
                    {selectedAmenities.includes(amenity) && <HiCheck className="mr-1 inline" />}
                    {amenity}
                  </button>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border p-6 shadow-lg"
              style={{
                backgroundColor: "rgba(245,241,233,0.88)",
                borderColor: "var(--border-soft)",
              }}
            >
              <h2 className="mb-4 font-display text-xl font-bold" style={{ color: "var(--primary)" }}>
                Property Photos
              </h2>
              <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
                Add photo URLs or upload images. First photo will be the main preview.
              </p>
              
              <div className="mb-4 flex flex-wrap gap-3">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative aspect-video w-32 overflow-hidden rounded-lg border">
                    <Image src={url} alt={`Photo ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhotoUrl(index)}
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <HiX />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="rounded-lg border px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--cta)" }}>
                  {uploadingPhoto ? "Uploading..." : "Upload Photos"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handlePhotoUpload(e.target.files)} disabled={uploadingPhoto} />
                </label>
                <div className="flex flex-1 gap-2">
                  <input
                    className="flex-1 rounded-lg border px-4 py-2"
                    style={{ borderColor: "var(--border-soft)" }}
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or paste photo URL..."
                  />
                  <button
                    type="button"
                    onClick={addPhotoUrl}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-2xl border p-6 shadow-lg"
              style={{
                backgroundColor: "rgba(245,241,233,0.88)",
                borderColor: "var(--border-soft)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold" style={{ color: "var(--primary)" }}>
                  Room Types
                </h2>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "var(--cta)", color: "var(--cta)" }}
                >
                  + Add Room
                </button>
              </div>

              {roomTypes.map((room, index) => (
                <div key={index} className="mb-6 rounded-lg border p-4" style={{ borderColor: "var(--border-soft)" }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Room {index + 1}</span>
                    {roomTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoomType(index)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Room Name
                      </span>
                      <input
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.name}
                        onChange={(e) => updateRoomType(index, "name", e.target.value)}
                        placeholder="e.g., Deluxe Suite"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Category
                      </span>
                      <select
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.category}
                        onChange={(e) => updateRoomType(index, "category", e.target.value)}
                      >
                        <option>Standard</option>
                        <option>Premium</option>
                        <option>Deluxe</option>
                        <option>Luxury</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Units Available
                      </span>
                      <input
                        type="number"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.units}
                        onChange={(e) => updateRoomType(index, "units", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Bed Configuration
                      </span>
                      <input
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.bedConfiguration}
                        onChange={(e) => updateRoomType(index, "bedConfiguration", e.target.value)}
                        placeholder="e.g., King bed + sofa"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Bathroom
                      </span>
                      <input
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.bathroom}
                        onChange={(e) => updateRoomType(index, "bathroom", e.target.value)}
                        placeholder="e.g., Ensuite with shower"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Max Occupancy
                      </span>
                      <input
                        type="number"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.maxOccupancy}
                        onChange={(e) => updateRoomType(index, "maxOccupancy", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                        Price Per Night (₹)
                      </span>
                      <input
                        type="number"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border-soft)" }}
                        value={room.pricePerNight}
                        onChange={(e) => updateRoomType(index, "pricePerNight", e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </motion.section>

            {submitStatus === "error" && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {errorMessage}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-end gap-4"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg"
                style={{ backgroundColor: "var(--cta)" }}
              >
                {isSubmitting ? "Submitting..." : "Submit Property"}
              </button>
            </motion.div>
          </form>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border p-8 text-center shadow-2xl"
            style={{ backgroundColor: "rgba(245,241,233,0.98)", borderColor: "var(--border-soft)" }}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                <HiCheck className="size-8 text-green-600" />
              </div>
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
              Property Submitted!
            </h2>
            <p className="mb-6" style={{ color: "var(--muted)" }}>
              Thank you for listing your property with Trayati Stays. Our team will review your submission within 48 hours and contact you once approved.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-lg px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--cta)" }}
              >
                Go to Home
              </Link>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-lg border px-6 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                Submit Another Property
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
