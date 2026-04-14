import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteManagedAssetByUrl } from "@/lib/stay-media";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const DEFAULT_BUCKET = "trayati-media";
const localUploadDir = path.join(process.cwd(), "public", "uploads", "properties");

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;
const JPEG_QUALITY = 82;

async function compressImage(buffer: Buffer, contentType: string): Promise<{ data: Buffer; type: string }> {
  const transformer = sharp(buffer, { animated: false });

  const metadata = await transformer.metadata();
  const hasAlpha = metadata.hasAlpha ?? false;
  const width = metadata.width ?? MAX_WIDTH;

  if (hasAlpha || contentType === "image/png") {
    const webpBuffer = await transformer
      .resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    if (webpBuffer.length < buffer.length * 0.85) {
      return { data: webpBuffer, type: "image/webp" };
    }
  }

  const jpegBuffer = await transformer
    .resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  if (jpegBuffer.length < buffer.length) {
    return { data: jpegBuffer, type: "image/jpeg" };
  }

  return { data: buffer, type: contentType };
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a valid file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 20 MB or smaller." }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  let processedBuffer: Buffer;
  let contentType: string;

  try {
    const result = await compressImage(rawBuffer, file.type);
    processedBuffer = result.data;
    contentType = result.type;
  } catch {
    processedBuffer = rawBuffer;
    contentType = file.type;
  }

  const extension = contentType === "image/webp" ? "webp" : contentType === "image/jpeg" ? "jpg" : (file.name.split(".").pop()?.toLowerCase() ?? "jpg");
  const storagePath = `admin/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  if (!supabase) {
    await fs.mkdir(localUploadDir, { recursive: true });
    const localFileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const localFilePath = path.join(localUploadDir, localFileName);
    await fs.writeFile(localFilePath, processedBuffer);

    return NextResponse.json({
      url: `/uploads/properties/${localFileName}`,
      path: localFilePath,
      storage: "local",
    });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, processedBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return NextResponse.json({ url: data.publicUrl, path: storagePath });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { url?: string };

  if (!body.url) {
    return NextResponse.json({ error: "A media url is required." }, { status: 400 });
  }

  try {
    await deleteManagedAssetByUrl(body.url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete uploaded media.",
      },
      { status: 500 },
    );
  }
}
