import "server-only";

import type { FeaturedStay } from "@/data/featured-stays";
import type { Experience, Testimonial } from "@/data/testimonials-and-blogs";
import { dbGetAllStays, dbGetAllTestimonials, dbGetAllExperiences, dbUpsertStay, dbUpsertTestimonial, dbUpsertExperience, dbDeleteStay, dbDeleteTestimonial, dbDeleteExperience, dbGetAllReservations } from "@/lib/db";

type ContentCollection = "stays" | "experiences" | "testimonials" | "reservations";

type ContentMap = {
  stays: FeaturedStay;
  experiences: Experience;
  testimonials: Testimonial;
  reservations: Record<string, unknown>;
};

export async function getContentCollection<C extends ContentCollection>(
  collection: C,
): Promise<ContentMap[C][]> {
  switch (collection) {
    case "stays":
      return (await dbGetAllStays()) as ContentMap[C][];
    case "testimonials":
      return (await dbGetAllTestimonials()) as ContentMap[C][];
    case "experiences":
      return (await dbGetAllExperiences()) as ContentMap[C][];
    case "reservations":
      return (await dbGetAllReservations()) as unknown as ContentMap[C][];
    default:
      return [];
  }
}

export async function saveContentItem<C extends ContentCollection>(
  collection: C,
  item: ContentMap[C] & { id: string },
) {
  switch (collection) {
    case "stays":
      return dbUpsertStay(item as FeaturedStay);
    case "testimonials":
      return dbUpsertTestimonial(item as Testimonial);
    case "experiences":
      return dbUpsertExperience(item as Experience);
    default:
      throw new Error(`Cannot save to collection: ${collection}`);
  }
}

export async function removeContentItem(collection: ContentCollection, id: string) {
  switch (collection) {
    case "stays":
      return dbDeleteStay(id);
    case "testimonials":
      return dbDeleteTestimonial(id);
    case "experiences":
      return dbDeleteExperience(id);
    default:
      throw new Error(`Cannot delete from collection: ${collection}`);
  }
}

export function isContentCollection(input: string): input is ContentCollection {
  return ["stays", "experiences", "testimonials", "reservations"].includes(input);
}
