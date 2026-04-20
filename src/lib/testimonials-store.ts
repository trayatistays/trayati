import "server-only";

import { dbGetAllTestimonials } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";
import type { Testimonial } from "@/data/testimonials-and-blogs";

const TESTIMONIALS_CACHE_PROFILE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
};

export async function getAllTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife(TESTIMONIALS_CACHE_PROFILE);
  cacheTag("testimonials-all", "testimonials");

  return dbGetAllTestimonials(true);
}
