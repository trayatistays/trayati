import "server-only";

import { dbGetAllExperiences } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";
import type { Experience } from "@/data/testimonials-and-blogs";

const EXPERIENCES_CACHE_PROFILE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
};

export async function getAllExperiences(): Promise<Experience[]> {
  "use cache";
  cacheLife(EXPERIENCES_CACHE_PROFILE);
  cacheTag("experiences-all", "experiences");

  return dbGetAllExperiences(true);
}
