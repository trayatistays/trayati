import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  deleteLocalItem,
  readLocalCollection,
  upsertLocalItem,
} from "@/lib/local-content-store";

const CONTENT_TABLE = "trayati_content";

export type ContentCollection =
  | "stays"
  | "experiences"
  | "testimonials"
  | "reservations";

type ContentRow<T> = {
  id: string;
  collection: ContentCollection;
  payload: T;
  updated_at?: string;
};

export async function getCollection<T>(
  collection: ContentCollection,
  fallback: T[],
) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return readLocalCollection(collection, fallback);
  }

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .select("id, collection, payload, updated_at")
    .eq("collection", collection)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(`Unable to load ${collection} from Supabase`, error);
    return readLocalCollection(collection, fallback);
  }

  return ((data ?? []) as ContentRow<T>[]).map((row) => row.payload);
}

export async function getContentItem<T>(
  collection: ContentCollection,
  id: string,
  fallback: T[],
) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const items = await readLocalCollection(collection, fallback);
    return items.find((item) => itemHasId(item, id)) ?? null;
  }

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .select("payload")
    .eq("collection", collection)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Unable to load ${collection}:${id} from Supabase`, error);
    const items = await readLocalCollection(collection, fallback);
    return items.find((item) => itemHasId(item, id)) ?? null;
  }

  return (data?.payload as T | undefined) ?? null;
}

export async function upsertContentItem<T extends { id: string }>(
  collection: ContentCollection,
  item: T,
  fallback: T[] = [],
) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return upsertLocalItem(collection, item, fallback);
  }

  const { error } = await supabase.from(CONTENT_TABLE).upsert(
    {
      collection,
      id: item.id,
      payload: item,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "collection,id" },
  );

  if (error) {
    console.error(`Unable to upsert ${collection} in Supabase`, error);
    return upsertLocalItem(collection, item, fallback);
  }

  return item;
}

export async function deleteContentItem(
  collection: ContentCollection,
  id: string,
  fallback: { id: string }[] = [],
) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return deleteLocalItem(collection, id, fallback);
  }

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .delete()
    .eq("collection", collection)
    .eq("id", id);

  if (error) {
    console.error(`Unable to delete ${collection} from Supabase`, error);
    return deleteLocalItem(collection, id, fallback);
  }

  return true;
}

function itemHasId<T>(item: T, id: string) {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    (item as { id?: unknown }).id === id
  );
}
