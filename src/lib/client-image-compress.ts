const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const JPEG_QUALITY = 0.82;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export async function compressImage(file: File): Promise<{ blob: Blob; name: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = JPEG_QUALITY;
      let blob: Blob | null = null;

      const tryCompress = () => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error("Failed to compress image"));
              return;
            }

            blob = result;

            if (blob.size > MAX_FILE_SIZE && quality > 0.1) {
              quality -= 0.1;
              tryCompress();
            } else {
              const ext = blob.type === "image/webp" ? "webp" : "jpg";
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              resolve({ blob, name: `${baseName}.${ext}` });
            }
          },
          "image/jpeg",
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
