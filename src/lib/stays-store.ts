import "server-only";

import { dbGetAllStays, dbGetStayById, dbUpsertStay, dbDeleteStay } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";
import type { FeaturedStay } from "@/data/featured-stays";

const STAYS_CACHE_PROFILE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
};

export async function getAllStays(): Promise<FeaturedStay[]> {
  "use cache";
  cacheLife(STAYS_CACHE_PROFILE);
  cacheTag("stays-all", "stays");

  return dbGetAllStays();
}

export async function getStayById(id: string) {
  "use cache";
  cacheLife(STAYS_CACHE_PROFILE);
  cacheTag("stays", `stay-${id}`);

  return dbGetStayById(id);
}

export async function createStay(stay: FeaturedStay) {
  return dbUpsertStay(stay);
}

export async function updateStay(id: string, stay: FeaturedStay) {
  return dbUpsertStay({ ...stay, id });
}

export async function upsertStay(stay: FeaturedStay) {
  return dbUpsertStay(stay);
}

export async function deleteStay(id: string) {
  return dbDeleteStay(id);
}
