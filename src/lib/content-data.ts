import "server-only";

import {
  experiences,
  testimonials,
  type Experience,
  type Testimonial,
} from "@/data/testimonials-and-blogs";
import type { FeaturedStay } from "@/data/featured-stays";
import { getAllStays } from "@/lib/stays-store";
import {
  deleteContentItem,
  getCollection,
  upsertContentItem,
  type ContentCollection,
} from "@/lib/content-store";

type ContentMap = {
  stays: FeaturedStay;
  experiences: Experience;
  testimonials: Testimonial;
  reservations: {
    id: string;
    [key: string]: unknown;
  };
};

export async function getContentCollection<C extends ContentCollection>(
  collection: C,
): Promise<ContentMap[C][]> {
  if (collection === "stays") {
    return (await getAllStays()) as ContentMap[C][];
  }

  if (collection === "experiences") {
    return (await getCollection("experiences", experiences)) as ContentMap[C][];
  }

  if (collection === "testimonials") {
    return (await getCollection("testimonials", testimonials)) as ContentMap[C][];
  }

  return (await getCollection("reservations", [])) as ContentMap[C][];
}

export async function saveContentItem<C extends ContentCollection>(
  collection: C,
  item: ContentMap[C] & { id: string },
) {
  const fallback = await getContentCollection(collection);
  return upsertContentItem(collection, item, fallback);
}

export async function removeContentItem(collection: ContentCollection, id: string) {
  const fallback = await getContentCollection(collection);
  return deleteContentItem(collection, id, fallback);
}

export function isContentCollection(input: string): input is ContentCollection {
  return ["stays", "experiences", "testimonials", "reservations"].includes(input);
}
