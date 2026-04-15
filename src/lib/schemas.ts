import { z } from "zod";
import { experienceTypes } from "@/data/experience-types";

const stringArray = z.array(z.string().trim().min(1)).default([]);

const amenitiesDetailSchema = z.object({
  parking: z.boolean().default(false),
  heaterOnRequest: z.boolean().default(false),
  tv: z.boolean().default(false),
  fridge: z.boolean().default(false),
  washingMachine: z.boolean().default(false),
  powerBackup: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
  geyser: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  garden: z.boolean().default(false),
  balcony: z.boolean().default(false),
  lounge: z.boolean().default(false),
  studyArea: z.boolean().default(false),
  fireplace: z.boolean().default(false),
  pool: z.boolean().default(false),
  spa: z.boolean().default(false),
}).default(() => ({
  parking: false,
  heaterOnRequest: false,
  tv: false,
  fridge: false,
  washingMachine: false,
  powerBackup: false,
  airConditioning: false,
  geyser: false,
  kitchen: false,
  garden: false,
  balcony: false,
  lounge: false,
  studyArea: false,
  fireplace: false,
  pool: false,
  spa: false,
}));

const mealOptionSchema = z.object({
  type: z.enum(["breakfast", "lunch", "dinner", "packed"]),
  available: z.boolean(),
  price: z.coerce.number().min(0).optional(),
  description: z.string().trim().optional(),
});

const cancellationPolicySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  refundPercentage: z.coerce.number().min(0).max(100),
  daysBeforeCheckin: z.coerce.number().int().min(0),
});

export const roomTypeSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  units: z.coerce.number().int().min(0),
  bedConfiguration: z.string().trim().min(1),
  bathroom: z.string().trim().min(1),
  extraBedOption: z.string().nullable().optional(),
  pricePerNight: z.coerce.number().min(0),
  maxOccupancy: z.coerce.number().int().min(1),
});

export const staySchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().min(1),
  location: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  country: z.string().trim().min(1),
  pin: z.string().trim().min(1),
  googleMapsUrl: z.string().trim().optional(),
  address: z.string().trim().min(1),
  description: z.string().trim().min(1),
  rating: z.coerce.number().min(0).max(5),
  pricePerNight: z.coerce.number().min(0),
  basePrice: z.coerce.number().min(0),
  image: z.string().trim().min(1),
  alt: z.string().trim().min(1),
  tag: z.string().trim().min(1),
  type: z.string().trim().min(1),
  experienceType: z.enum(experienceTypes),
  amenities: stringArray,
  photos: stringArray,
  roomTypes: z.array(roomTypeSchema).default([]),
  amenitiesDetail: amenitiesDetailSchema,
  mealOptions: z.array(mealOptionSchema).default([]),
  cancellationPolicies: z.array(cancellationPolicySchema).default([]),
  isFeatured: z.coerce.boolean().default(false),
  bookingLink: z.string().trim().optional(),
});

export const experienceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  content: z.string().default(""),
  image: z.string().trim().min(1),
  category: z.string().trim().min(1),
  author: z.string().trim().optional(),
  readTime: z.coerce.number().int().min(1).optional(),
  date: z.string().trim().min(1),
  featured: z.coerce.boolean().default(false),
});

export const testimonialSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  title: z.string().trim().min(1),
  image: z.string().trim().min(1),
  rating: z.coerce.number().min(0).max(5),
  text: z.string().trim().min(1),
  source: z.string().trim().optional(),
  date: z.string().trim().min(1),
});

export const reservationSchema = z.object({
  id: z.string().trim().min(1),
  stayId: z.string().trim().min(1),
  roomId: z.string().trim().optional(),
  checkIn: z.string().trim().min(1),
  checkOut: z.string().trim().min(1),
  guests: z.coerce.number().int().min(1),
  clerkUserId: z.string().trim().min(1),
  userName: z.string().trim().optional(),
  userEmail: z.string().trim().optional(),
  propertyName: z.string().trim().optional(),
  status: z.enum(["requested", "confirmed", "cancelled"]).default("requested"),
  createdAt: z.string().trim().min(1),
});

export function slugifyId(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
