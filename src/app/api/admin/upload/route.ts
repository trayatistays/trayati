import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
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
    return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `admin/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  if (!supabase) {
    await fs.mkdir(localUploadDir, { recursive: true });
    const localFileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const localFilePath = path.join(localUploadDir, localFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(localFilePath, buffer);

    return NextResponse.json({
      url: `/uploads/properties/${localFileName}`,
      path: localFilePath,
      storage: "local",
    });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return NextResponse.json({ url: data.publicUrl, path: storagePath });
}
