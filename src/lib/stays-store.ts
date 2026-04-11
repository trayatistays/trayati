import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { featuredStays, type FeaturedStay } from "@/data/featured-stays";
import {
  deleteContentItem,
  getCollection,
  getContentItem,
  upsertContentItem,
} from "@/lib/content-store";

const staysFilePath = path.join(process.cwd(), "src", "data", "stays.json");

type StaysPayload = {
  stays: FeaturedStay[];
  updatedAt: string;
};

async function ensureDirectory() {
  await fs.mkdir(path.dirname(staysFilePath), { recursive: true });
}

async function writePayload(stays: FeaturedStay[]) {
  await ensureDirectory();
  const payload: StaysPayload = {
    stays,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(staysFilePath, JSON.stringify(payload, null, 2), "utf8");
}

export async function getAllStays(): Promise<FeaturedStay[]> {
  const supabaseStays = await getCollection<FeaturedStay>("stays", []);
  if (supabaseStays.length > 0) {
    return supabaseStays;
  }

  try {
    const raw = await fs.readFile(staysFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StaysPayload>;
    if (Array.isArray(parsed.stays)) {
      return parsed.stays;
    }
  } catch {
    await writePayload(featuredStays);
  }

  return featuredStays;
}

export async function getStayById(id: string) {
  const supabaseStay = await getContentItem<FeaturedStay>("stays", id, []);
  if (supabaseStay) {
    return supabaseStay;
  }

  const stays = await getAllStays();
  return stays.find((stay) => stay.id === id) ?? null;
}

export async function createStay(stay: FeaturedStay) {
  try {
    return await upsertContentItem("stays", stay);
  } catch (error) {
    console.warn("Falling back to local stay storage.", error);
  }

  const stays = await getAllStays();
  const nextStays = [stay, ...stays];
  await writePayload(nextStays);
  return stay;
}

export async function updateStay(id: string, stay: FeaturedStay) {
  try {
    return await upsertContentItem("stays", { ...stay, id });
  } catch (error) {
    console.warn("Falling back to local stay storage.", error);
  }

  const stays = await getAllStays();
  const index = stays.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const nextStays = [...stays];
  nextStays[index] = stay;
  await writePayload(nextStays);
  return stay;
}

export async function deleteStay(id: string) {
  try {
    return await deleteContentItem("stays", id);
  } catch (error) {
    console.warn("Falling back to local stay storage.", error);
  }

  const stays = await getAllStays();
  const nextStays = stays.filter((stay) => stay.id !== id);

  if (nextStays.length === stays.length) {
    return false;
  }

  await writePayload(nextStays);
  return true;
}
