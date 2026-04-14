import "server-only";

import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { FeaturedStay } from "@/data/featured-stays";
import type { Experience, Testimonial } from "@/data/testimonials-and-blogs";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// ─── STAYS ─────────────────────────────────────────────────────────

type StayRow = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  city: string;
  state: string;
  country: string;
  pin: string;
  address: string;
  google_maps_url: string;
  description: string;
  rating: number;
  price_per_night: number;
  base_price: number;
  image: string;
  alt: string;
  tag: string;
  type: string;
  experience_type: string;
  amenities: unknown;
  photos: unknown;
  room_types: unknown;
  amenities_detail: unknown;
  meal_options: unknown;
  cancellation_policies: unknown;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function ensureObject<T>(value: unknown): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

export async function dbGetAllStays(activeOnly = false): Promise<FeaturedStay[]> {
  const supabase = requireSupabaseAdmin();
  let query = supabase.from("stays").select("*").order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch stays: ${error.message}`);
  return (data as StayRow[]).map((row) => dbRowToStay(row));
}

export async function dbGetStayById(id: string): Promise<FeaturedStay | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("stays").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch stay ${id}: ${error.message}`);
  if (!data) return null;
  return dbRowToStay(data as StayRow);
}

export async function dbGetStayBySlug(slug: string): Promise<FeaturedStay | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("stays").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Failed to fetch stay by slug ${slug}: ${error.message}`);
  if (!data) return null;
  return dbRowToStay(data as StayRow);
}

export async function dbUpsertStay(stay: FeaturedStay & { isActive?: boolean; sortOrder?: number }): Promise<FeaturedStay> {
  const supabase = requireSupabaseAdmin();
  const row = stayToDbRow(stay);
  const { error } = await supabase.from("stays").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`Failed to upsert stay: ${error.message}`);
  return stay;
}

export async function dbDeleteStay(id: string): Promise<boolean> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("stays").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete stay: ${error.message}`);
  return true;
}

export async function dbToggleStayActive(id: string, isActive: boolean): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("stays").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`Failed to toggle stay: ${error.message}`);
}

export function dbRowToStay(row: StayRow): FeaturedStay {
  const amenitiesDetail = ensureObject<
    FeaturedStay["amenitiesDetail"] & { featured?: boolean }
  >(row.amenities_detail);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    location: row.location,
    city: row.city,
    state: row.state,
    country: row.country,
    pin: row.pin,
    googleMapsUrl: row.google_maps_url || undefined,
    address: row.address,
    description: row.description,
    rating: row.rating,
    pricePerNight: row.price_per_night,
    basePrice: row.base_price,
    image: row.image,
    alt: row.alt,
    tag: row.tag,
    type: row.type,
    experienceType: row.experience_type as FeaturedStay["experienceType"],
    amenities: ensureArray(row.amenities),
    photos: ensureArray(row.photos),
    roomTypes: ensureArray<FeaturedStay["roomTypes"][number]>(row.room_types),
    amenitiesDetail: {
      parking: amenitiesDetail.parking ?? false,
      heaterOnRequest: amenitiesDetail.heaterOnRequest ?? false,
      tv: amenitiesDetail.tv ?? false,
      fridge: amenitiesDetail.fridge ?? false,
      washingMachine: amenitiesDetail.washingMachine ?? false,
      powerBackup: amenitiesDetail.powerBackup ?? false,
      airConditioning: amenitiesDetail.airConditioning ?? false,
      geyser: amenitiesDetail.geyser ?? false,
      kitchen: amenitiesDetail.kitchen ?? false,
      garden: amenitiesDetail.garden ?? false,
      balcony: amenitiesDetail.balcony ?? false,
      lounge: amenitiesDetail.lounge ?? false,
      studyArea: amenitiesDetail.studyArea ?? false,
      fireplace: amenitiesDetail.fireplace ?? false,
      pool: amenitiesDetail.pool ?? false,
      spa: amenitiesDetail.spa ?? false,
    },
    mealOptions: ensureArray<FeaturedStay["mealOptions"][number]>(row.meal_options),
    cancellationPolicies: ensureArray<FeaturedStay["cancellationPolicies"][number]>(row.cancellation_policies),
    isFeatured: amenitiesDetail.featured === true,
  };
}

function stayToDbRow(stay: FeaturedStay & { isActive?: boolean; sortOrder?: number }): Record<string, unknown> {
  const amenitiesDetail = {
    ...(stay.amenitiesDetail ?? {}),
    featured: stay.isFeatured === true,
  };

  return {
    id: stay.id,
    title: stay.title,
    subtitle: stay.subtitle,
    location: stay.location,
    city: stay.city,
    state: stay.state,
    country: stay.country,
    pin: stay.pin,
    address: stay.address,
    google_maps_url: stay.googleMapsUrl ?? "",
    description: stay.description,
    rating: stay.rating,
    price_per_night: stay.pricePerNight,
    base_price: stay.basePrice,
    image: stay.image,
    alt: stay.alt,
    tag: stay.tag,
    type: stay.type,
    experience_type: stay.experienceType,
    amenities: JSON.stringify(stay.amenities ?? []),
    photos: JSON.stringify(stay.photos ?? []),
    room_types: JSON.stringify(stay.roomTypes ?? []),
    amenities_detail: JSON.stringify(amenitiesDetail),
    meal_options: JSON.stringify(stay.mealOptions ?? []),
    cancellation_policies: JSON.stringify(stay.cancellationPolicies ?? []),
    is_active: (stay as Record<string, unknown>).isActive !== false,
    sort_order: (stay as Record<string, unknown>).sortOrder ?? 0,
  };
}

// ─── TESTIMONIALS ──────────────────────────────────────────────────

type TestimonialRow = {
  id: string;
  name: string;
  title: string;
  text: string;
  rating: number;
  image: string;
  source: string;
  date: string;
  is_active: boolean;
  sort_order: number;
};

export async function dbGetAllTestimonials(activeOnly = false): Promise<Testimonial[]> {
  const supabase = requireSupabaseAdmin();
  let query = supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch testimonials: ${error.message}`);
  return (data as TestimonialRow[]).map((row) => dbRowToTestimonial(row));
}

export async function dbUpsertTestimonial(t: Testimonial & { isActive?: boolean; sortOrder?: number }): Promise<Testimonial> {
  const supabase = requireSupabaseAdmin();
  const row = {
    id: t.id,
    name: t.name,
    title: t.title,
    text: t.text,
    rating: t.rating,
    image: t.image,
    source: t.source ?? "",
    date: t.date,
    is_active: (t as Record<string, unknown>).isActive !== false,
    sort_order: (t as Record<string, unknown>).sortOrder ?? 0,
  };
  const { error } = await supabase.from("testimonials").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`Failed to upsert testimonial: ${error.message}`);
  return t;
}

export async function dbDeleteTestimonial(id: string): Promise<boolean> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete testimonial: ${error.message}`);
  return true;
}

export async function dbToggleTestimonialActive(id: string, isActive: boolean): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("testimonials").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`Failed to toggle testimonial: ${error.message}`);
}

function dbRowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    text: row.text,
    rating: row.rating,
    image: row.image,
    source: row.source || undefined,
    date: row.date,
  };
}

// ─── EXPERIENCES ───────────────────────────────────────────────────

type ExperienceRow = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  date: string;
  read_time: number | null;
  is_active: boolean;
  sort_order: number;
};

export async function dbGetAllExperiences(activeOnly = false): Promise<Experience[]> {
  const supabase = requireSupabaseAdmin();
  let query = supabase.from("experiences").select("*").order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch experiences: ${error.message}`);
  return (data as ExperienceRow[]).map((row) => dbRowToExperience(row));
}

export async function dbUpsertExperience(e: Experience & { isActive?: boolean; sortOrder?: number }): Promise<Experience> {
  const supabase = requireSupabaseAdmin();
  const row = {
    id: e.id,
    title: e.title,
    description: e.description,
    image: e.image,
    category: e.category,
    author: e.author ?? "",
    date: e.date,
    read_time: e.readTime ?? null,
    is_active: (e as Record<string, unknown>).isActive !== false,
    sort_order: (e as Record<string, unknown>).sortOrder ?? 0,
  };
  const { error } = await supabase.from("experiences").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`Failed to upsert experience: ${error.message}`);
  return e;
}

export async function dbDeleteExperience(id: string): Promise<boolean> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete experience: ${error.message}`);
  return true;
}

export async function dbToggleExperienceActive(id: string, isActive: boolean): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("experiences").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`Failed to toggle experience: ${error.message}`);
}

function dbRowToExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    category: row.category,
    author: row.author || undefined,
    readTime: row.read_time ?? undefined,
    date: row.date,
    featured: false,
  };
}

// ─── PROPERTY SUBMISSIONS ──────────────────────────────────────────

type SubmissionRow = {
  id: string;
  clerk_user_id: string;
  user_name: string;
  user_email: string;
  property_payload: unknown;
  status: string;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type PropertySubmission = {
  id: string;
  clerkUserId: string;
  userName: string;
  userEmail: string;
  propertyPayload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

export async function dbGetAllSubmissions(): Promise<PropertySubmission[]> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("property_submissions").select("*").order("submitted_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch submissions: ${error.message}`);
  return (data as SubmissionRow[]).map(dbRowToSubmission);
}

export async function dbGetSubmissionById(id: string): Promise<PropertySubmission | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("property_submissions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch submission: ${error.message}`);
  if (!data) return null;
  return dbRowToSubmission(data as SubmissionRow);
}

export async function dbCreateSubmission(sub: Omit<PropertySubmission, "submittedAt">): Promise<PropertySubmission> {
  const supabase = requireSupabaseAdmin();
  const row = {
    id: sub.id,
    clerk_user_id: sub.clerkUserId,
    user_name: sub.userName,
    user_email: sub.userEmail,
    property_payload: JSON.stringify(sub.propertyPayload),
    status: sub.status,
    admin_notes: sub.adminNotes ?? null,
  };
  const { error } = await supabase.from("property_submissions").insert(row);
  if (error) throw new Error(`Failed to create submission: ${error.message}`);
  return { ...sub, submittedAt: new Date().toISOString() };
}

export async function dbUpdateSubmissionStatus(id: string, status: "approved" | "rejected", adminNotes?: string): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("property_submissions").update({
    status,
    admin_notes: adminNotes ?? null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: "admin",
  }).eq("id", id);
  if (error) throw new Error(`Failed to update submission: ${error.message}`);
}

function dbRowToSubmission(row: SubmissionRow): PropertySubmission {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    propertyPayload: (row.property_payload as Record<string, unknown>) ?? {},
    status: row.status as PropertySubmission["status"],
    adminNotes: row.admin_notes ?? undefined,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
  };
}

// ─── CONTACT MESSAGES ──────────────────────────────────────────────

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  isRead: boolean;
  createdAt: string;
};

export async function dbGetAllMessages(): Promise<ContactMessage[]> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch messages: ${error.message}`);
  return (data as Record<string, unknown>[]).map((row) => toCamelCase<ContactMessage>(row));
}

export async function dbMarkMessageRead(id: string): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
  if (error) throw new Error(`Failed to mark message read: ${error.message}`);
}

// ─── RESERVATIONS ──────────────────────────────────────────────────

export type Reservation = {
  id: string;
  stayId: string;
  roomId: string | null;
  clerkUserId: string;
  userName: string;
  userEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

export async function dbGetAllReservations(): Promise<Reservation[]> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch reservations: ${error.message}`);
  return (data as Record<string, unknown>[]).map((row) => toCamelCase<Reservation>(row));
}

export async function dbCreateReservation(res: Omit<Reservation, "id" | "createdAt">): Promise<Reservation> {
  const supabase = requireSupabaseAdmin();
  const row = toSnakeCase(res as Record<string, unknown>);
  const { data, error } = await supabase.from("reservations").insert(row).select("id").single();
  if (error) throw new Error(`Failed to create reservation: ${error.message}`);
  return { ...res, id: (data as Record<string, unknown>).id as string, createdAt: new Date().toISOString() };
}

export async function dbUpdateReservationStatus(id: string, status: string): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
  if (error) throw new Error(`Failed to update reservation: ${error.message}`);
}
