import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteManagedAssetByUrl } from "@/lib/stay-media";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const DEFAULT_BUCKET = "trayati-media";
const localUploadDir = path.join(process.cwd(), "public", "uploads", "properties");

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
    return NextResponse.json({ error: `Image must be ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB or smaller. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `admin/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  if (!supabase) {
    try {
      await fs.mkdir(localUploadDir, { recursive: true });
      const localFileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const localFilePath = path.join(localUploadDir, localFileName);
      await fs.writeFile(localFilePath, buffer);

      return NextResponse.json({
        url: `/uploads/properties/${localFileName}`,
        path: localFilePath,
        storage: "local",
      });
    } catch (localError) {
      console.error("Local file write failed:", localError);
      return NextResponse.json({ error: `Local upload failed: ${localError instanceof Error ? localError.message : "Unknown error"}` }, { status: 500 });
    }
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
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
