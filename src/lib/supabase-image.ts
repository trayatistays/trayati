import "server-only";

const SUPABASE_PUBLIC_PREFIX = "/storage/v1/object/public/";
const SUPABASE_CDN_PREFIX = "/storage/v1/render/image/public/";

function getSupabaseUrl(): string | null {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "trayati-media";
}

export function isSupabaseUrl(url: string): boolean {
  if (!url.startsWith("http")) return false;
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return false;
  try {
    const parsed = new URL(url);
    const projectHost = new URL(supabaseUrl).hostname;
    return parsed.hostname === projectHost;
  } catch {
    return false;
  }
}

export function extractSupabaseStoragePath(url: string): string | null {
  if (!isSupabaseUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const bucket = getBucketName();
    const objectMarker = `${SUPABASE_PUBLIC_PREFIX}${bucket}/`;
    const objectIdx = parsed.pathname.indexOf(objectMarker);
    if (objectIdx === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(objectIdx + objectMarker.length)) || null;
  } catch {
    return null;
  }
}

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "origin" | "webp" | "avif";
  resize?: "cover" | "contain" | "fill";
};

export function getSupabaseCdnUrl(
  url: string,
  options: ImageTransformOptions = {},
): string {
  if (!isSupabaseUrl(url)) return url;

  const storagePath = extractSupabaseStoragePath(url);
  if (!storagePath) return url;

  const supabaseUrl = getSupabaseUrl()!;
  const bucket = getBucketName();
  const base = `${supabaseUrl}${SUPABASE_CDN_PREFIX}${bucket}/${storagePath}`;

  const params = new URLSearchParams();
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));
  if (options.format && options.format !== "origin") params.set("format", options.format);
  if (options.resize) params.set("resize", options.resize);

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function getOptimizedImageUrl(
  url: string,
  width?: number,
  quality: number = 75,
): string {
  return getSupabaseCdnUrl(url, {
    width,
    quality,
    format: "webp",
    resize: "cover",
  });
}

export function getBlurPlaceholderUrl(url: string): string {
  return getSupabaseCdnUrl(url, {
    width: 8,
    quality: 30,
    format: "webp",
    resize: "cover",
  });
}
