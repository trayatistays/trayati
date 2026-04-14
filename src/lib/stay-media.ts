import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeaturedStay } from "@/data/featured-stays";
import { getCollection } from "@/lib/content-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_BUCKET = "trayati-media";
const LOCAL_UPLOAD_PREFIX = "/uploads/properties/";
const SUPABASE_PUBLIC_PREFIX = "/storage/v1/object/public/";

function getBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;
}

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.filter(Boolean)));
}

export function getStayAssetUrls(stay: Pick<FeaturedStay, "image" | "photos">) {
  return uniqueUrls([stay.image, ...stay.photos]);
}

function isManagedLocalUrl(url: string) {
  return url.startsWith(LOCAL_UPLOAD_PREFIX);
}

function getLocalPathFromUrl(url: string) {
  if (!isManagedLocalUrl(url)) {
    return null;
  }

  const relativePath = url.replace(/^\/+/, "").split("/").join(path.sep);
  return path.join(process.cwd(), "public", relativePath);
}

function getSupabaseStoragePath(url: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const bucket = getBucketName();
  const marker = `${SUPABASE_PUBLIC_PREFIX}${bucket}/`;
  const markerIndex = parsedUrl.pathname.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const storagePath = decodeURIComponent(
    parsedUrl.pathname.slice(markerIndex + marker.length),
  );

  return storagePath || null;
}

export async function deleteManagedAssetByUrl(url: string) {
  const localPath = getLocalPathFromUrl(url);

  if (localPath) {
    await fs.rm(localPath, { force: true });
    return;
  }

  const storagePath = getSupabaseStoragePath(url);

  if (!storagePath) {
    return;
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.storage
    .from(getBucketName())
    .remove([storagePath]);

  if (error) {
    throw new Error(`Unable to delete media asset "${url}": ${error.message}`);
  }
}

export async function cleanupUnusedStayAssets(candidateUrls: string[]) {
  const uniqueCandidates = uniqueUrls(candidateUrls);

  if (!uniqueCandidates.length) {
    return;
  }

  const stays = await getCollection<FeaturedStay>("stays");
  const activeAssetUrls = new Set(
    stays.flatMap((stay) => getStayAssetUrls(stay)),
  );

  const urlsToDelete = uniqueCandidates.filter((url) => !activeAssetUrls.has(url));

  for (const url of urlsToDelete) {
    try {
      await deleteManagedAssetByUrl(url);
    } catch (error) {
      console.error("Unable to delete unused stay media.", error);
    }
  }
}
