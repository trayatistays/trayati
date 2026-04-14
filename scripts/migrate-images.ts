import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "trayati-media";
const publicUrlBase = `${url}/storage/v1/object/public/${bucket}`;
const renderUrlBase = `${url}/render/image/authenticated/${bucket}`;

const IMAGE_MAP: { localPath: string; storagePath: string; width: number; quality: number }[] = [
  { localPath: "public/samar-villa.png", storagePath: "properties/samar-villa.webp", width: 1200, quality: 80 },
  { localPath: "public/property-exterior.jpg", storagePath: "properties/property-exterior.webp", width: 1200, quality: 80 },
  { localPath: "public/property-view.jpg", storagePath: "properties/property-view.webp", width: 1200, quality: 80 },
  { localPath: "public/property-bedroom.jpg", storagePath: "properties/property-bedroom.webp", width: 1200, quality: 80 },
  { localPath: "public/property-balcony.jpg", storagePath: "properties/property-balcony.webp", width: 1200, quality: 80 },
  { localPath: "public/property-lounge.jpg", storagePath: "properties/property-lounge.webp", width: 1200, quality: 80 },
  { localPath: "public/menu-blogs.jpg", storagePath: "menu/menu-blogs.webp", width: 800, quality: 75 },
  { localPath: "public/menu-about.jpg", storagePath: "menu/menu-about.webp", width: 800, quality: 75 },
  { localPath: "public/menu-solutions.jpg", storagePath: "menu/menu-solutions.webp", width: 800, quality: 75 },
  { localPath: "public/menu-connect.jpg", storagePath: "menu/menu-connect.webp", width: 800, quality: 75 },
  { localPath: "public/trayati-logo.jpg", storagePath: "brand/trayati-logo.webp", width: 400, quality: 80 },
];

const URL_REPLACEMENTS: Record<string, string> = {
  "/samar-villa.png": "properties/samar-villa.webp",
  "/property-exterior.jpg": "properties/property-exterior.webp",
  "/property-view.jpg": "properties/property-view.webp",
  "/property-bedroom.jpg": "properties/property-bedroom.webp",
  "/property-balcony.jpg": "properties/property-balcony.webp",
  "/property-lounge.jpg": "properties/property-lounge.webp",
};

async function compressAndUpload() {
  console.log("=== Compressing & uploading images to Supabase Storage ===\n");

  for (const { localPath, storagePath, width, quality } of IMAGE_MAP) {
    const absPath = resolve(localPath);

    if (!existsSync(absPath)) {
      console.log(`  ⚠ Skipping ${localPath} — file not found`);
      continue;
    }

    const originalSize = readFileSync(absPath).length;
    const compressed = await sharp(absPath)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    const compressedSize = compressed.length;
    const savings = Math.round((1 - compressedSize / originalSize) * 100);

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, compressed, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      console.error(`  ❌ ${localPath}: ${error.message}`);
    } else {
      console.log(`  ✓ ${localPath} (${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressedSize / 1024).toFixed(0)}KB, -${savings}%) → ${storagePath}`);
    }
  }
}

async function updateDatabaseUrls() {
  console.log("\n=== Updating database records ===\n");

  const { data: stays, error: staysError } = await supabase
    .from("stays")
    .select("id, image, photos");

  if (staysError) {
    console.error("  ❌ Failed to fetch stays:", staysError.message);
    return;
  }

  for (const stay of stays ?? []) {
    let needsUpdate = false;
    const updates: Record<string, unknown> = {};

    if (typeof stay.image === "string" && stay.image.startsWith("/")) {
      const storagePath = URL_REPLACEMENTS[stay.image];
      if (storagePath) {
        updates.image = `${publicUrlBase}/${storagePath}`;
        needsUpdate = true;
      }
    }

    if (Array.isArray(stay.photos)) {
      const newPhotos = stay.photos.map((p: string) => {
        const storagePath = URL_REPLACEMENTS[p];
        return storagePath ? `${publicUrlBase}/${storagePath}` : p;
      });

      if (JSON.stringify(newPhotos) !== JSON.stringify(stay.photos)) {
        updates.photos = JSON.stringify(newPhotos);
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const { error } = await supabase.from("stays").update(updates).eq("id", stay.id);
      if (error) {
        console.error(`  ❌ Stay ${stay.id}: ${error.message}`);
      } else {
        console.log(`  ✓ Stay ${stay.id} updated`);
      }
    }
  }
}

async function main() {
  await compressAndUpload();
  await updateDatabaseUrls();
  console.log("\n=== Migration complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
