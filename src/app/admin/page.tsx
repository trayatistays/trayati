"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { featuredStays, type FeaturedStay } from "@/data/featured-stays";
import {
  experiences,
  testimonials,
  type Experience,
  type Testimonial,
} from "@/data/testimonials-and-blogs";
import { experienceTypes } from "@/data/experience-types";
import { slugifyId } from "@/lib/schemas";
import { HiStar } from "react-icons/hi";

type Collection = "stays" | "experiences" | "testimonials" | "reservations" | "submissions";
type AdminItem = Record<string, unknown> & { id: string };

const collections: { id: Collection; label: string; description: string }[] = [
  { id: "stays", label: "Stays", description: "Location-wise stays, rooms, rates, amenities, and photos." },
  { id: "experiences", label: "Experiences", description: "Stories, destination content, and blog cards." },
  { id: "testimonials", label: "Testimonials", description: "Guest reviews for trust and conversion." },
  { id: "reservations", label: "Reservations", description: "Reserve Now requests captured from signed-in users." },
  { id: "submissions", label: "Property Submissions", description: "Property listings submitted by users awaiting approval." },
];

type ReservationRecord = {
  id: string;
  clerkUserId: string;
  userName: string;
  userEmail: string;
  stayId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "requested" | "confirmed" | "cancelled";
  createdAt: string;
};

type PropertySubmission = {
  id: string;
  clerk_user_id: string;
  user_name: string;
  user_email: string;
  property_payload: FeaturedStay;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
};

function createStayTemplate(): FeaturedStay {
  return {
    ...featuredStays[0],
    id: `trayati-stay-${Date.now()}`,
    title: "New Trayati Stay",
    subtitle: "Trayati Stays",
    location: "Kasar Devi, Uttarakhand",
    city: "Kasar Devi",
    state: "Uttarakhand",
    country: "India",
    pin: "000000",
    address: "Update the full address",
    description: "Describe the stay, the view, the mood, and why a traveler should care.",
    rating: 4.8,
    pricePerNight: 10000,
    basePrice: 10000,
    tag: "Premium Stay",
    type: "Boutique Stay",
    image: "/trayati-logo.jpg",
    alt: "Trayati stay",
    photos: ["/trayati-logo.jpg"],
    experienceType: "Folklore Homestays",
    amenities: ["Scenic views", "WiFi", "Curated hospitality"],
  };
}

const templates: Record<Collection, AdminItem> = {
  stays: createStayTemplate(),
  experiences: {
    ...experiences[0],
    id: `experience-${Date.now()}`,
    title: "New Experience",
    featured: false,
  },
  testimonials: {
    ...testimonials[0],
    id: `testimonial-${Date.now()}`,
    name: "Guest Name",
    text: "Guest feedback goes here.",
  },
  reservations: {
    id: `reservation-${Date.now()}`,
    stayId: featuredStays[0]?.id ?? "stay-id",
    checkIn: new Date().toISOString().slice(0, 10),
    checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    guests: 1,
    clerkUserId: "created-by-admin",
    status: "requested",
    createdAt: new Date().toISOString(),
  },
  submissions: {
    id: `submission-${Date.now()}`,
    clerk_user_id: "",
    user_name: "",
    user_email: "",
    property_payload: createStayTemplate(),
    status: "pending",
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    admin_notes: null,
  },
};

function itemTitle(item: AdminItem) {
  return String(
    item.title ?? item.name ?? item.propertyName ?? item.userName ?? item.id,
  );
}

function formatJson(item: AdminItem) {
  return JSON.stringify(item, null, 2);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: ReservationRecord["status"] }) {
  const styles = {
    requested: {
      backgroundColor: "rgba(234,179,8,0.12)",
      color: "#b45309",
      borderColor: "rgba(234,179,8,0.4)",
    },
    confirmed: {
      backgroundColor: "rgba(34,197,94,0.12)",
      color: "#15803d",
      borderColor: "rgba(34,197,94,0.4)",
    },
    cancelled: {
      backgroundColor: "rgba(239,68,68,0.12)",
      color: "#b91c1c",
      borderColor: "rgba(239,68,68,0.4)",
    },
  } as const;

  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
      style={styles[status]}
    >
      {status}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = rating >= index + 1;
        const partial = !fill && rating > index;
        return (
          <HiStar
            key={`star-${index}`}
            className="text-[1rem]"
            style={{
              color: fill ? "#d97706" : "rgba(217,119,6,0.35)",
              opacity: partial ? 0.65 : 1,
            }}
          />
        );
      })}
      <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Admin credentials were not accepted.");
      return;
    }

    onLogin();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border p-6 shadow-xl" style={{ backgroundColor: "rgba(245,241,232,0.94)", borderColor: "var(--border-soft)" }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="relative size-12 overflow-hidden rounded-full">
            <Image src="/trayati-logo.jpg" alt="Trayati" fill className="object-cover" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Trayati Admin</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Manage live site content</p>
          </div>
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Username</span>
          <input className="w-full rounded-lg border px-4 py-3" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Password</span>
          <input className="w-full rounded-lg border px-4 py-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white" disabled={isSubmitting} style={{ backgroundColor: "var(--cta)" }}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

function StayEditor({ stay, onChange, onUploadPhotos, uploading }: { stay: FeaturedStay; onChange: (stay: FeaturedStay) => void; onUploadPhotos: (files: FileList | null) => Promise<void>; uploading: boolean; }) {
  function setField<K extends keyof FeaturedStay>(key: K, value: FeaturedStay[K]) {
    const next = { ...stay, [key]: value };
    if (key === "title" || key === "city" || key === "state") {
      const title = key === "title" ? String(value) : next.title;
      const city = key === "city" ? String(value) : next.city;
      const state = key === "state" ? String(value) : next.state;
      next.id = slugifyId(`${title}-${city}-${state}`) || next.id;
      next.alt = `${title} in ${city}, ${state}`;
      next.location = `${city}, ${state}`;
    }
    onChange(next);
  }

  function updatePhoto(index: number, value: string) {
    const photos = [...stay.photos];
    photos[index] = value;
    onChange({ ...stay, photos, image: index === 0 ? value || stay.image : stay.image });
  }

  function addPhotoField() {
    onChange({ ...stay, photos: [...stay.photos, ""] });
  }

  function removePhoto(index: number) {
    const photos = stay.photos.filter((_, currentIndex) => currentIndex !== index);
    onChange({ ...stay, photos: photos.length ? photos : [stay.image], image: photos[0] || stay.image });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Stay Name</span><input className="w-full rounded-lg border px-4 py-3" value={stay.title} onChange={(event) => setField("title", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">SEO Id</span><input className="w-full rounded-lg border px-4 py-3" value={stay.id} onChange={(event) => setField("id", slugifyId(event.target.value))} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">City</span><input className="w-full rounded-lg border px-4 py-3" value={stay.city} onChange={(event) => setField("city", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">State</span><input className="w-full rounded-lg border px-4 py-3" value={stay.state} onChange={(event) => setField("state", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Country</span><input className="w-full rounded-lg border px-4 py-3" value={stay.country} onChange={(event) => setField("country", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Pin Code</span><input className="w-full rounded-lg border px-4 py-3" value={stay.pin} onChange={(event) => setField("pin", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Tag</span><input className="w-full rounded-lg border px-4 py-3" value={stay.tag} onChange={(event) => setField("tag", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Type</span><input className="w-full rounded-lg border px-4 py-3" value={stay.type} onChange={(event) => setField("type", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Experience Type</span><select className="w-full rounded-lg border px-4 py-3" value={stay.experienceType} onChange={(event) => setField("experienceType", event.target.value as FeaturedStay["experienceType"])}>{experienceTypes.map((type) => (<option key={type} value={type}>{type}</option>))}</select></label>
        <label className="block md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Subtitle</span><input className="w-full rounded-lg border px-4 py-3" value={stay.subtitle} onChange={(event) => setField("subtitle", event.target.value)} /></label>
        <label className="block md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Address</span><input className="w-full rounded-lg border px-4 py-3" value={stay.address} onChange={(event) => setField("address", event.target.value)} /></label>
        <label className="block md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Google Maps URL</span><input className="w-full rounded-lg border px-4 py-3" value={stay.googleMapsUrl ?? ""} onChange={(event) => setField("googleMapsUrl", event.target.value)} /></label>
        <label className="block md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">SEO Description</span><textarea className="min-h-32 w-full rounded-lg border px-4 py-3" value={stay.description} onChange={(event) => setField("description", event.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Price Per Night</span><input className="w-full rounded-lg border px-4 py-3" type="number" value={stay.pricePerNight} onChange={(event) => setField("pricePerNight", Number(event.target.value))} /></label>
        <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Rating</span><input className="w-full rounded-lg border px-4 py-3" type="number" step="0.1" min="0" max="5" value={stay.rating} onChange={(event) => setField("rating", Number(event.target.value))} /></label>
        <label className="block md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">Amenities</span><input className="w-full rounded-lg border px-4 py-3" value={stay.amenities.join(", ")} onChange={(event) => setField("amenities", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold">Property Photos</h3>
            <p className="text-sm text-slate-600">Upload as many property photos as you need. The first image becomes the main preview.</p>
          </div>
          <label className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--cta)" }}>
            {uploading ? "Uploading..." : "Upload Photos"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void onUploadPhotos(event.target.files)} />
          </label>
        </div>
        <div className="grid gap-3">
          {stay.photos.map((photo, index) => (
            <div key={`${photo}-${index}`} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[9rem_1fr_auto]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                {photo ? <Image src={photo} alt={`${stay.title} photo ${index + 1}`} fill className="object-cover" sizes="144px" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">No photo</div>}
              </div>
              <input className="w-full rounded-lg border px-4 py-3" value={photo} onChange={(event) => updatePhoto(index, event.target.value)} placeholder="Photo URL" />
              <button type="button" onClick={() => removePhoto(index)} className="rounded-lg border px-4 py-3 text-sm font-semibold text-red-700">Remove</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addPhotoField} className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold">Add Photo URL</button>
      </div>
    </div>
  );
}

function ExperienceEditor({
  experience,
  onChange,
}: {
  experience: Experience;
  onChange: (experience: Experience) => void;
}) {
  function setField<K extends keyof Experience>(key: K, value: Experience[K]) {
    onChange({ ...experience, [key]: value });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Title
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={experience.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Category
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={experience.category}
            onChange={(event) => setField("category", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Author
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={experience.author ?? ""}
            onChange={(event) => setField("author", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Date
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            type="date"
            value={experience.date}
            onChange={(event) => setField("date", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Read Time (min)
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            type="number"
            min={1}
            value={experience.readTime ?? ""}
            onChange={(event) =>
              setField(
                "readTime",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </label>
        <label className="flex items-center gap-3 rounded-lg border px-4 py-3">
          <input
            type="checkbox"
            className="size-4"
            checked={experience.featured}
            onChange={(event) => setField("featured", event.target.checked)}
          />
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">
            Featured
          </span>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Description
          </span>
          <textarea
            className="min-h-32 w-full rounded-lg border px-4 py-3"
            value={experience.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-white/60">
          {experience.image ? (
            <Image
              src={experience.image}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              No image
            </div>
          )}
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Image URL
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={experience.image}
            onChange={(event) => setField("image", event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function TestimonialEditor({
  testimonial,
  onChange,
}: {
  testimonial: Testimonial;
  onChange: (testimonial: Testimonial) => void;
}) {
  function setField<K extends keyof Testimonial>(
    key: K,
    value: Testimonial[K],
  ) {
    onChange({ ...testimonial, [key]: value });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Name
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={testimonial.name}
            onChange={(event) => setField("name", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Title
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={testimonial.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Source
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={testimonial.source ?? ""}
            onChange={(event) => setField("source", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Date
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            type="date"
            value={testimonial.date}
            onChange={(event) => setField("date", event.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
            Rating (0-5)
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="w-32 rounded-lg border px-4 py-3"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={testimonial.rating}
              onChange={(event) =>
                setField("rating", Number(event.target.value))
              }
            />
            <StarRating rating={testimonial.rating} />
          </div>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Text
          </span>
          <textarea
            className="min-h-32 w-full rounded-lg border px-4 py-3"
            value={testimonial.text}
            onChange={(event) => setField("text", event.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-white/60">
          {testimonial.image ? (
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              No image
            </div>
          )}
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.18em]">
            Image URL
          </span>
          <input
            className="w-full rounded-lg border px-4 py-3"
            value={testimonial.image}
            onChange={(event) => setField("image", event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [collection, setCollection] = useState<Collection>("stays");
  const [items, setItems] = useState<AdminItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [activeEditor, setActiveEditor] = useState<"form" | "json">("form");

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);
  const selectedStay = useMemo(
    () => (collection === "stays" ? (selectedItem as FeaturedStay | null) : null),
    [collection, selectedItem],
  );
  const selectedExperience = useMemo(
    () =>
      collection === "experiences"
        ? (selectedItem as Experience | null)
        : null,
    [collection, selectedItem],
  );
  const selectedTestimonial = useMemo(
    () =>
      collection === "testimonials"
        ? (selectedItem as Testimonial | null)
        : null,
    [collection, selectedItem],
  );

  function updateSelectedItem(nextItem: AdminItem) {
    setItems((currentItems) => currentItems.some((item) => item.id === nextItem.id) ? currentItems.map((item) => (item.id === nextItem.id ? nextItem : item)) : [nextItem, ...currentItems]);
    setSelectedId(nextItem.id);
    setDraft(formatJson(nextItem));
  }

const loadCollection = useCallback(async (nextCollection: Collection = collection) => {
    setIsBusy(true);
    setError(null);

    let url = "";
    if (nextCollection === "reservations") {
      url = "/api/admin/reservations";
    } else if (nextCollection === "submissions") {
      url = "/api/admin/submissions";
    } else {
      url = `/api/admin/content/${nextCollection}`;
    }

    const response = await fetch(url, { cache: "no-store" });
    const data = (await response.json()) as {
      items?: AdminItem[];
      reservations?: ReservationRecord[];
      submissions?: PropertySubmission[];
      error?: string;
    };
    setIsBusy(false);

    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }

    if (!response.ok) {
      setError(data.error ?? "Unable to load content.");
      return;
    }

    let nextItems: AdminItem[] = [];
    if (nextCollection === "submissions") {
      nextItems = (data.submissions ?? []) as AdminItem[];
    } else if (nextCollection === "reservations") {
      nextItems = data.reservations ?? [];
    } else {
      nextItems = data.items ?? [];
    }
    const first = nextItems[0] ?? templates[nextCollection];
    setItems(nextItems);
    setSelectedId(first.id ?? null);
    setDraft(formatJson(first));
  }, [collection]);

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        setAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) {
          void loadCollection("stays");
        }
      })
      .catch(() => setAuthenticated(false));
  }, [loadCollection]);

  async function saveDraft() {
    setIsBusy(true);
    setNotice(null);
    setError(null);

    let parsed: AdminItem;
    try {
      parsed = JSON.parse(draft) as AdminItem;
    } catch {
      setError("The editor contains invalid JSON.");
      setIsBusy(false);
      return;
    }

    if (!parsed.id) {
      setError("Every item needs an id.");
      setIsBusy(false);
      return;
    }

    const isExisting = items.some((item) => item.id === parsed.id);
    const response = await fetch(isExisting ? `/api/admin/content/${collection}/${encodeURIComponent(parsed.id)}` : `/api/admin/content/${collection}`, { method: isExisting ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) });
    const data = (await response.json()) as { item?: AdminItem; error?: string };
    setIsBusy(false);

    if (!response.ok || !data.item) {
      setError(data.error ?? "Unable to save item.");
      return;
    }

    updateSelectedItem(data.item);
    setNotice("Saved successfully.");
  }

async function deleteSelected() {
    if (!selectedId) return;
    setIsBusy(true);
    setNotice(null);
    setError(null);

    if (collection === "submissions") {
      const response = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      const data = (await response.json()) as { error?: string };
      setIsBusy(false);
      if (!response.ok) {
        setError(data.error ?? "Unable to delete submission.");
        return;
      }
      const nextItems = items.filter((item) => item.id !== selectedId);
      const nextSelected = nextItems[0] ?? null;
      setItems(nextItems);
      setSelectedId(nextSelected?.id ?? null);
      setDraft(nextSelected ? formatJson(nextSelected) : formatJson(templates[collection]));
      setNotice("Submission deleted.");
      return;
    }

    const response = await fetch(`/api/admin/content/${collection}/${encodeURIComponent(selectedId)}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setIsBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to delete item.");
      return;
    }

    const nextItems = items.filter((item) => item.id !== selectedId);
    const nextSelected = nextItems[0] ?? null;
    setItems(nextItems);
    setSelectedId(nextSelected?.id ?? null);
    setDraft(nextSelected ? formatJson(nextSelected) : formatJson(templates[collection]));
    setNotice("Deleted.");
  }

  async function approveSubmission() {
    if (collection !== "submissions" || !selectedId) return;
    setIsBusy(true);
    setNotice(null);
    setError(null);

    const response = await fetch("/api/admin/submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, action: "approve" }),
    });
    const data = (await response.json()) as { error?: string };
    setIsBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to approve submission.");
      return;
    }

    const currentSubmission = items.find((item) => item.id === selectedId) as PropertySubmission | undefined;
    if (currentSubmission?.property_payload) {
      const propertyStay: FeaturedStay = {
        ...currentSubmission.property_payload,
        id: currentSubmission.property_payload.id || `stay-${Date.now()}`,
      };
      const saveResponse = await fetch("/api/admin/content/stays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyStay),
      });
      const saveData = (await saveResponse.json()) as { item?: AdminItem; error?: string };
      if (!saveResponse.ok || !saveData.item) {
        setNotice("Submission approved but failed to add to stays.");
        return;
      }
    }

    setNotice("Submission approved and added to stays.");
    void loadCollection("submissions");
  }

  async function rejectSubmission() {
    if (collection !== "submissions" || !selectedId) return;
    setIsBusy(true);
    setNotice(null);
    setError(null);

    const response = await fetch("/api/admin/submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, action: "reject" }),
    });
    const data = (await response.json()) as { error?: string };
    setIsBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to reject submission.");
      return;
    }

    setNotice("Submission rejected.");
    void loadCollection("submissions");
  }

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length || !selectedStay) return;
    setIsBusy(true);
    setError(null);
    setNotice(null);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setIsBusy(false);
        setError(data.error ?? `Unable to upload ${file.name}.`);
        return;
      }

      uploadedUrls.push(data.url);
    }

    updateSelectedItem({ ...selectedStay, image: selectedStay.image || uploadedUrls[0], photos: [...selectedStay.photos, ...uploadedUrls] });
    setIsBusy(false);
    setNotice(`${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} uploaded.`);
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
  }

  if (authenticated === null) {
    return <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }} />;
  }

  if (!authenticated) {
    return <AdminLogin onLogin={() => { setAuthenticated(true); void loadCollection("stays"); }} />;
  }

const supportsFormEditor = ["stays", "experiences", "testimonials"].includes(
    collection,
  );
  const isReadOnly = collection === "reservations" || collection === "submissions";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <header className="sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl" style={{ backgroundColor: "rgba(245,241,232,0.94)", borderColor: "var(--border-soft)" }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Trayati Admin</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>SEO-ready content, local JSON fallback, and property media management.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--border-soft)", color: "var(--primary)" }}>Public Site</Link>
            <button onClick={logout} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--primary)" }}>Logout</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-3">
          {collections.map((entry) => (
            <button
              key={entry.id}
              onClick={() => {
                setCollection(entry.id);
                setActiveEditor("form");
                void loadCollection(entry.id);
              }}
              className="w-full rounded-lg border p-4 text-left transition"
              style={{
                borderColor:
                  collection === entry.id ? "var(--cta)" : "var(--border-soft)",
                backgroundColor:
                  collection === entry.id
                    ? "rgba(199,91,26,0.08)"
                    : "rgba(245,241,232,0.82)",
              }}
            >
              <span className="font-display text-lg font-bold">{entry.label}</span>
              <span className="mt-1 block text-sm" style={{ color: "var(--muted)" }}>{entry.description}</span>
            </button>
          ))}
        </aside>

        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <section className="rounded-lg border p-4" style={{ backgroundColor: "rgba(245,241,232,0.82)", borderColor: "var(--border-soft)" }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">{collections.find((entry) => entry.id === collection)?.label}</h2>
              {!isReadOnly && (
                <button
                  onClick={() => {
                    const next =
                      collection === "stays"
                        ? createStayTemplate()
                        : { ...templates[collection], id: `${collection}-${Date.now()}` };
                    updateSelectedItem(next);
                  }}
                  className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
                  style={{ backgroundColor: "var(--cta)" }}
                >
                  Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setDraft(formatJson(item));
                  }}
                  className="w-full rounded-lg border p-3 text-left"
                  style={{
                    borderColor:
                      selectedId === item.id
                        ? "var(--primary)"
                        : "var(--border-soft)",
                    backgroundColor:
                      selectedId === item.id
                        ? "rgba(30,109,191,0.08)"
                        : "rgba(255,255,255,0.45)",
                  }}
                >
                  <span className="block truncate font-semibold">{itemTitle(item)}</span>
                  <span className="block truncate text-xs" style={{ color: "var(--muted)" }}>{item.id}</span>
                </button>
              ))}
              {!items.length && (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {isReadOnly
                    ? "No reservations yet."
                    : "No records yet. Add one to start."}
                </p>
              )}
            </div>
          </section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="rounded-lg border p-4" style={{ backgroundColor: "rgba(245,241,232,0.9)", borderColor: "var(--border-soft)" }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">Editor</h2>
<p className="text-sm" style={{ color: "var(--muted)" }}>
                  {collection === "stays"
                    ? "Use the stay form for quick edits, then switch to JSON if you want full control."
                    : collection === "experiences"
                      ? "Curate experience stories with the form, or jump into JSON for full control."
                      : collection === "testimonials"
                        ? "Manage guest reviews via the form, with JSON available for full control."
                        : collection === "submissions"
                          ? "Review user-submitted properties. Approve to add to stays, or reject to decline."
                          : "Reservations are read-only and enriched with guest details."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {supportsFormEditor && (
                  <>
                    <button
                      onClick={() => setActiveEditor("form")}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor:
                          activeEditor === "form"
                            ? "rgba(30,109,191,0.08)"
                            : "transparent",
                      }}
                    >
                      {collection === "stays" ? "Stay Form" : "Form"}
                    </button>
                    <button
                      onClick={() => setActiveEditor("json")}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor:
                          activeEditor === "json"
                            ? "rgba(30,109,191,0.08)"
                            : "transparent",
                      }}
                    >
                      JSON
                    </button>
                  </>
                )}
{!isReadOnly && (
                  <>
                    <button
                      onClick={saveDraft}
                      disabled={isBusy}
                      className="rounded-lg px-4 py-2 text-sm font-bold text-white"
                      style={{ backgroundColor: "var(--cta)" }}
                    >
                      {isBusy ? "Working..." : "Save"}
                    </button>
                    <button
                      onClick={deleteSelected}
                      disabled={!selectedId || isBusy}
                      className="rounded-lg border px-4 py-2 text-sm font-bold"
                      style={{
                        borderColor: "rgba(220,38,38,0.4)",
                        color: "#b91c1c",
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            {notice && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}
            {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {collection === "stays" && selectedStay && activeEditor === "form" ? (
              <StayEditor
                stay={selectedStay}
                onChange={(nextStay) => updateSelectedItem(nextStay)}
                onUploadPhotos={uploadPhotos}
                uploading={isBusy}
              />
            ) : collection === "experiences" &&
              selectedExperience &&
              activeEditor === "form" ? (
              <ExperienceEditor
                experience={selectedExperience}
                onChange={(nextExperience) => updateSelectedItem(nextExperience)}
              />
            ) : collection === "testimonials" &&
              selectedTestimonial &&
              activeEditor === "form" ? (
              <TestimonialEditor
                testimonial={selectedTestimonial}
                onChange={(nextTestimonial) =>
                  updateSelectedItem(nextTestimonial)
                }
              />
            ) : collection === "reservations" ? (
              <div className="space-y-4">
                <div className="hidden rounded-lg border bg-white/60 md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-[52rem] w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.16em]">
                        <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                          <th className="px-4 py-3">Guest Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Property</th>
                          <th className="px-4 py-3">Check-In</th>
                          <th className="px-4 py-3">Check-Out</th>
                          <th className="px-4 py-3">Guests</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(items as ReservationRecord[]).map((reservation) => (
                          <tr
                            key={reservation.id}
                            className="border-b last:border-none"
                            style={{ borderColor: "var(--border-soft)" }}
                          >
                            <td className="px-4 py-3 font-semibold">
                              {reservation.userName || "Unknown guest"}
                            </td>
                            <td className="px-4 py-3">
                              {reservation.userEmail || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {reservation.propertyName || reservation.stayId}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(reservation.checkIn)}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(reservation.checkOut)}
                            </td>
                            <td className="px-4 py-3">{reservation.guests}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={reservation.status} />
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(reservation.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-4 md:hidden">
                  {(items as ReservationRecord[]).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="rounded-lg border bg-white/70 p-4"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {reservation.userName || "Unknown guest"}
                          </p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {reservation.userEmail || "—"}
                          </p>
                        </div>
                        <StatusBadge status={reservation.status} />
                      </div>
                      <div className="mt-3 grid gap-2 text-xs">
                        <p>
                          <span className="font-semibold">Property: </span>
                          {reservation.propertyName || reservation.stayId}
                        </p>
                        <p>
                          <span className="font-semibold">Check-In: </span>
                          {formatDate(reservation.checkIn)}
                        </p>
                        <p>
                          <span className="font-semibold">Check-Out: </span>
                          {formatDate(reservation.checkOut)}
                        </p>
                        <p>
                          <span className="font-semibold">Guests: </span>
                          {reservation.guests}
                        </p>
                        <p>
                          <span className="font-semibold">Requested: </span>
                          {formatDate(reservation.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
) : collection === "submissions" ? (
              <div className="space-y-4">
                {(items as PropertySubmission[]).map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-lg border p-4"
                    style={{
                      borderColor: submission.status === "pending" ? "rgba(234,179,8,0.5)" : submission.status === "approved" ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)",
                      backgroundColor: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-display text-lg font-bold">{submission.property_payload?.title || "Untitled Property"}</h3>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          Submitted by {submission.user_name} ({submission.user_email})
                        </p>
                      </div>
                      <span
                        className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                        style={{
                          backgroundColor: submission.status === "pending" ? "rgba(234,179,8,0.12)" : submission.status === "approved" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                          color: submission.status === "pending" ? "#b45309" : submission.status === "approved" ? "#15803d" : "#b91c1c",
                          borderColor: submission.status === "pending" ? "rgba(234,179,8,0.4)" : submission.status === "approved" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
                        }}
                      >
                        {submission.status}
                      </span>
                    </div>
                    
                    {selectedId === submission.id && (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Location</p>
                            <p className="text-sm">{submission.property_payload?.city}, {submission.property_payload?.state}, {submission.property_payload?.country}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Price per Night</p>
                            <p className="text-sm">₹{submission.property_payload?.pricePerNight?.toLocaleString() || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Type</p>
                            <p className="text-sm">{submission.property_payload?.type || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Submitted</p>
                            <p className="text-sm">{formatDate(submission.submitted_at)}</p>
                          </div>
                        </div>
                        
                        {submission.property_payload?.description && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Description</p>
                            <p className="text-sm">{submission.property_payload.description}</p>
                          </div>
                        )}
                        
                        {submission.property_payload?.amenities && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Amenities</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {submission.property_payload.amenities.map((amenity, i) => (
                                <span key={i} className="rounded-full border px-2 py-1 text-xs">{amenity}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {submission.property_payload?.photos && submission.property_payload.photos.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Photos ({submission.property_payload.photos.length})</p>
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                              {submission.property_payload.photos.slice(0, 5).map((photo, i) => (
                                <div key={i} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border">
                                  <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="80px" />
                                </div>
                              ))}
                              {submission.property_payload.photos.length > 5 && (
                                <div className="flex items-center justify-center w-20 h-20 rounded-lg border bg-gray-100 text-sm">
                                  +{submission.property_payload.photos.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {submission.property_payload?.roomTypes && submission.property_payload.roomTypes.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Room Types</p>
                            <div className="mt-2 space-y-2">
                              {submission.property_payload.roomTypes.map((room, i) => (
                                <div key={i} className="rounded border p-3 text-sm">
                                  <p className="font-semibold">{room.name} ({room.category})</p>
                                  <p style={{ color: "var(--muted)" }}>{room.bedConfiguration} - ₹{room.pricePerNight}/night</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {submission.status === "pending" && (
                          <div className="flex flex-wrap gap-3 pt-4 border-t">
                            <button
                              onClick={approveSubmission}
                              disabled={isBusy}
                              className="rounded-lg px-4 py-2 text-sm font-bold text-white"
                              style={{ backgroundColor: "#15803d" }}
                            >
                              {isBusy ? "Processing..." : "Approve & Add to Stays"}
                            </button>
                            <button
                              onClick={rejectSubmission}
                              disabled={isBusy}
                              className="rounded-lg border px-4 py-2 text-sm font-bold"
                              style={{ borderColor: "rgba(239,68,68,0.4)", color: "#b91c1c" }}
                            >
                              Reject
                            </button>
                          </div>
)}
              </div>
            )}
                  </div>
                ))}
                {!items.length && (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No pending submissions.
                  </p>
                )}
              </div>
            ) : (
              <textarea
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  try {
                    updateSelectedItem(
                      JSON.parse(event.target.value) as AdminItem,
                    );
                  } catch {}
                }}
                spellCheck={false}
                className="min-h-[36rem] w-full rounded-lg border bg-slate-950 p-4 font-mono text-sm text-slate-50 outline-none"
              />
            )}
          </motion.section>
        </div>
      </section>
    </main>
  );
}
