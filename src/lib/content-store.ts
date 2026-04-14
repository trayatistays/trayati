import "server-only";

import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

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

const CONTENT_CACHE_PROFILE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
};

export async function getCollection<T>(
  collection: ContentCollection,
) {
  "use cache";

  cacheLife(CONTENT_CACHE_PROFILE);
  cacheTag(`collection-${collection}`);

  const supabase = requireSupabaseAdmin();

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .select("id, collection, payload, updated_at")
    .eq("collection", collection)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load ${collection}: ${error.message}`);
  }

  return ((data ?? []) as ContentRow<T>[]).map((row) => row.payload);
}

export async function getContentItem<T>(
  collection: ContentCollection,
  id: string,
) {
  "use cache";

  cacheLife(CONTENT_CACHE_PROFILE);
  cacheTag(`collection-${collection}`, `item-${collection}-${id}`);

  const supabase = requireSupabaseAdmin();

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .select("payload")
    .eq("collection", collection)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load ${collection}:${id}: ${error.message}`);
  }

  return (data?.payload as T | undefined) ?? null;
}

export async function upsertContentItem<T extends { id: string }>(
  collection: ContentCollection,
  item: T,
) {
  const supabase = requireSupabaseAdmin();

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
    throw new Error(`Unable to save ${collection}:${item.id}: ${error.message}`);
  }

  revalidateTag(`collection-${collection}`, "max");
  revalidateTag(`item-${collection}-${item.id}`, "max");

  return item;
}

export async function deleteContentItem(
  collection: ContentCollection,
  id: string,
) {
  const existingItem = await getContentItem<{ id: string }>(collection, id);

  if (!existingItem) {
    return false;
  }

  const supabase = requireSupabaseAdmin();

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .delete()
    .eq("collection", collection)
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to delete ${collection}:${id}: ${error.message}`);
  }

  revalidateTag(`collection-${collection}`, "max");
  revalidateTag(`item-${collection}-${id}`, "max");

  return true;
}
