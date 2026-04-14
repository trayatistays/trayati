import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { existsSync, statSync, writeFileSync } from "node:fs";
import { resolve, extname, basename } from "node:path";
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

type ImageEntry = {
  localPath: string;
  storagePath: string;
  maxWidth: number;
  quality: number;
};

const PROPERTY_IMAGES: ImageEntry[] = [
  { localPath: "public/samar-villa.png", storagePath: "properties/samar-villa.webp", maxWidth: 1920, quality: 80 },
  { localPath: "public/property-exterior.jpg", storagePath: "properties/property-exterior.webp", maxWidth: 1920, quality: 80 },
  { localPath: "public/property-view.jpg", storagePath: "properties/property-view.webp", maxWidth: 1920, quality: 80 },
  { localPath: "public/property-bedroom.jpg", storagePath: "properties/property-bedroom.webp", maxWidth: 1920, quality: 80 },
  { localPath: "public/property-balcony.jpg", storagePath: "properties/property-balcony.webp", maxWidth: 1920, quality: 80 },
  { localPath: "public/property-lounge.jpg", storagePath: "properties/property-lounge.webp", maxWidth: 1920, quality: 80 },
];

const MENU_IMAGES: ImageEntry[] = [
  { localPath: "public/menu-blogs.jpg", storagePath: "menu/menu-blogs.webp", maxWidth: 800, quality: 75 },
  { localPath: "public/menu-about.jpg", storagePath: "menu/menu-about.webp", maxWidth: 800, quality: 75 },
  { localPath: "public/menu-solutions.jpg", storagePath: "menu/menu-solutions.webp", maxWidth: 800, quality: 75 },
  { localPath: "public/menu-connect.jpg", storagePath: "menu/menu-connect.webp", maxWidth: 800, quality: 75 },
];

const BRAND_IMAGES: ImageEntry[] = [
  { localPath: "public/trayati-logo.jpg", storagePath: "brand/trayati-logo.webp", maxWidth: 400, quality: 80 },
];

const EXPERIENCE_IMAGES: ImageEntry[] = [
  { localPath: "public/images/experiences/apartments.png", storagePath: "experiences/apartments.webp", maxWidth: 600, quality: 80 },
  { localPath: "public/images/experiences/homestays.png", storagePath: "experiences/homestays.webp", maxWidth: 600, quality: 80 },
  { localPath: "public/images/experiences/villas.png", storagePath: "experiences/villas.webp", maxWidth: 600, quality: 80 },
];

const ALL_IMAGES = [...PROPERTY_IMAGES, ...MENU_IMAGES, ...BRAND_IMAGES, ...EXPERIENCE_IMAGES];

async function clearStorageBucket() {
  console.log("\n=== Step 1: Clearing Supabase storage bucket ===\n");

  const folders = ["properties", "menu", "brand", "experiences", "admin"];

  for (const folder of folders) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });

    if (error) {
      console.log(`  ⚠ Could not list ${folder}/: ${error.message}`);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`  ✓ ${folder}/ is already empty`);
      continue;
    }

    const filesToRemove = data.map((f) => `${folder}/${f.name}`);

    const { error: removeError } = await supabase.storage.from(bucket).remove(filesToRemove);

    if (removeError) {
      console.error(`  ❌ Failed to clear ${folder}/: ${removeError.message}`);
    } else {
      console.log(`  ✓ Cleared ${filesToRemove.length} files from ${folder}/`);
    }
  }
}

async function compressAndUpload() {
  console.log("\n=== Step 2: Compressing & uploading images ===\n");

  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const { localPath, storagePath, maxWidth, quality } of ALL_IMAGES) {
    const absPath = resolve(localPath);

    if (!existsSync(absPath)) {
      console.log(`  ⚠ Skipping ${localPath} — file not found`);
      continue;
    }

    const originalSize = statSync(absPath).size;
    totalOriginal += originalSize;

    const compressed = await sharp(absPath, { animated: false })
      .resize(maxWidth, null, { withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

    const compressedSize = compressed.length;
    totalCompressed += compressedSize;
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
      console.log(
        `  ✓ ${basename(localPath)} (${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressedSize / 1024).toFixed(0)}KB, -${savings}%) → ${storagePath}`,
      );
    }
  }

  console.log(
    `\n  Total: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(totalCompressed / 1024 / 1024).toFixed(1)}MB (${Math.round((1 - totalCompressed / totalOriginal) * 100)}% reduction)`,
  );
}

async function updateDatabaseUrls() {
  console.log("\n=== Step 3: Updating database image URLs ===\n");

  const urlMapping: Record<string, string> = {
    "/samar-villa.png": `${publicUrlBase}/properties/samar-villa.webp`,
    "/property-exterior.jpg": `${publicUrlBase}/properties/property-exterior.webp`,
    "/property-view.jpg": `${publicUrlBase}/properties/property-view.webp`,
    "/property-bedroom.jpg": `${publicUrlBase}/properties/property-bedroom.webp`,
    "/property-balcony.jpg": `${publicUrlBase}/properties/property-balcony.webp`,
    "/property-lounge.jpg": `${publicUrlBase}/properties/property-lounge.webp`,
  };

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

    if (typeof stay.image === "string" && urlMapping[stay.image]) {
      updates.image = urlMapping[stay.image];
      needsUpdate = true;
    }

    if (typeof stay.image === "string" && stay.image.startsWith("/") && !urlMapping[stay.image]) {
      if (stay.image.includes("supabase") || stay.image.includes("storage")) {
        // skip
      } else {
        console.log(`  ⚠ Unmapped local image for stay ${stay.id}: ${stay.image}`);
      }
    }

    if (Array.isArray(stay.photos)) {
      const newPhotos = (stay.photos as string[]).map((p: string) => {
        if (urlMapping[p]) return urlMapping[p];
        return p;
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
        console.log(`  ✓ Stay ${stay.id} — image URLs updated to CDN`);
      }
    } else {
      console.log(`  · Stay ${stay.id} — no local URLs to update`);
    }
  }

  // Update content table
  const { data: contentStays, error: contentError } = await supabase
    .from("trayati_content")
    .select("id, payload")
    .eq("collection", "stays");

  if (!contentError && contentStays) {
    for (const row of contentStays) {
      const payload = row.payload as Record<string, unknown>;
      let needsUpdate = false;

      if (typeof payload.image === "string" && urlMapping[payload.image]) {
        payload.image = urlMapping[payload.image];
        needsUpdate = true;
      }

      if (Array.isArray(payload.photos)) {
        const newPhotos = (payload.photos as string[]).map((p: string) => urlMapping[p] ?? p);
        if (JSON.stringify(newPhotos) !== JSON.stringify(payload.photos)) {
          payload.photos = newPhotos;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        const { error } = await supabase
          .from("trayati_content")
          .update({ payload, updated_at: new Date().toISOString() })
          .eq("id", row.id);
        if (error) {
          console.error(`  ❌ Content ${row.id}: ${error.message}`);
        } else {
          console.log(`  ✓ Content ${row.id} — payload URLs updated`);
        }
      }
    }
  }
}

async function compressLocalFiles() {
  console.log("\n=== Step 4: Compressing local public/ images ===\n");

  const localImages = [
    { path: "public/samar-villa.png", maxWidth: 1920, quality: 80 },
    { path: "public/property-exterior.jpg", maxWidth: 1920, quality: 80 },
    { path: "public/property-view.jpg", maxWidth: 1920, quality: 80 },
    { path: "public/property-bedroom.jpg", maxWidth: 1920, quality: 80 },
    { path: "public/property-balcony.jpg", maxWidth: 1920, quality: 80 },
    { path: "public/property-lounge.jpg", maxWidth: 1920, quality: 80 },
    { path: "public/menu-blogs.jpg", maxWidth: 800, quality: 75 },
    { path: "public/menu-about.jpg", maxWidth: 800, quality: 75 },
    { path: "public/menu-solutions.jpg", maxWidth: 800, quality: 75 },
    { path: "public/menu-connect.jpg", maxWidth: 800, quality: 75 },
    { path: "public/images/experiences/apartments.png", maxWidth: 600, quality: 80 },
    { path: "public/images/experiences/homestays.png", maxWidth: 600, quality: 80 },
    { path: "public/images/experiences/villas.png", maxWidth: 600, quality: 80 },
  ];

  for (const { path: imgPath, maxWidth, quality } of localImages) {
    const absPath = resolve(imgPath);

    if (!existsSync(absPath)) {
      console.log(`  ⚠ Skipping ${imgPath} — not found`);
      continue;
    }

    const originalSize = statSync(absPath).size;
    const ext = extname(imgPath);

    if (ext === ".webp") {
      console.log(`  · ${basename(imgPath)} — already WebP, skipping`);
      continue;
    }

    const webpPath = imgPath.replace(/\.[^.]+$/, ".webp");

    const compressed = await sharp(absPath, { animated: false })
      .resize(maxWidth, null, { withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

    writeFileSync(webpPath, compressed);

    const savings = Math.round((1 - compressed.length / originalSize) * 100);
    console.log(
      `  ✓ ${basename(imgPath)} → ${basename(webpPath)} (${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressed.length / 1024).toFixed(0)}KB, -${savings}%)`,
    );
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Trayati — Compress, Clear & Reseed Storage  ║");
  console.log("╚══════════════════════════════════════════════╝");

  await clearStorageBucket();
  await compressAndUpload();
  await updateDatabaseUrls();
  await compressLocalFiles();

  console.log("\n=== All done! ===");
  console.log("Images are now served via Supabase CDN with WebP compression.");
  console.log("Run `npm run seed` to re-seed content if needed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
