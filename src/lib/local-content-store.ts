import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { ContentCollection } from "@/lib/content-store";

const contentDir = path.join(process.cwd(), "data", "content");

type LocalPayload<T> = {
  items: T[];
  updatedAt: string;
};

function getFilePath(collection: ContentCollection) {
  return path.join(contentDir, `${collection}.json`);
}

async function ensureDirectory() {
  await fs.mkdir(contentDir, { recursive: true });
}

export async function readLocalCollection<T>(
  collection: ContentCollection,
  fallback: T[],
) {
  try {
    const raw = await fs.readFile(getFilePath(collection), "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalPayload<T>>;
    if (Array.isArray(parsed.items)) {
      if (parsed.items.length === 0 && fallback.length > 0) {
        await writeLocalCollection(collection, fallback);
        return fallback;
      }
      return parsed.items;
    }
  } catch {
    await writeLocalCollection(collection, fallback);
  }

  return fallback;
}

export async function writeLocalCollection<T>(
  collection: ContentCollection,
  items: T[],
) {
  await ensureDirectory();
  await fs.writeFile(
    getFilePath(collection),
    JSON.stringify(
      {
        items,
        updatedAt: new Date().toISOString(),
      } satisfies LocalPayload<T>,
      null,
      2,
    ),
    "utf8",
  );
}

export async function upsertLocalItem<T extends { id: string }>(
  collection: ContentCollection,
  item: T,
  fallback: T[],
) {
  const items = await readLocalCollection(collection, fallback);
  const next = [item, ...items.filter((existing) => existing.id !== item.id)];
  await writeLocalCollection(collection, next);
  return item;
}

export async function deleteLocalItem<T extends { id: string }>(
  collection: ContentCollection,
  id: string,
  fallback: T[],
) {
  const items = await readLocalCollection(collection, fallback);
  const next = items.filter((item) => item.id !== id);
  await writeLocalCollection(collection, next);
  return true;
}
