// --- Room Type Definition -----------------------------------------
import type { ExperienceType } from "@/data/experience-types";

export type RoomType = {
  id: string;
  name: string;
  category: string;
  units: number;
  bedConfiguration: string;
  bathroom: string;
  extraBedOption?: string | null;
  maxOccupancy: number;
};

export type AmenitiesDetail = {
  parking: boolean;
  heaterOnRequest: boolean;
  tv: boolean;
  fridge: boolean;
  washingMachine: boolean;
  powerBackup: boolean;
  airConditioning: boolean;
  geyser: boolean;
  kitchen: boolean;
  garden: boolean;
  balcony: boolean;
  lounge: boolean;
  studyArea: boolean;
  fireplace: boolean;
  pool: boolean;
  spa: boolean;
};

export type MealOption = {
  type: "breakfast" | "lunch" | "dinner" | "packed";
  available: boolean;
  price?: number;
  description?: string;
};

export type CancellationPolicy = {
  name: string;
  description: string;
  refundPercentage: number;
  daysBeforeCheckin: number;
};

export type FeaturedStay = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  city: string;
  state: string;
  country: string;
  pin: string;
  googleMapsUrl?: string;
  address: string;
  description: string;
  rating: number;
  reviewCount?: number;
  image: string;
  alt: string;
  tag: string;
  type: string;
  experienceType: ExperienceType;
  amenities: string[];
  photos: string[];
  roomTypes: RoomType[];
  amenitiesDetail: AmenitiesDetail;
  mealOptions: MealOption[];
  cancellationPolicies: CancellationPolicy[];
  isFeatured?: boolean;
  bookingLink?: string;
};

export const featuredStays: FeaturedStay[] = [];
