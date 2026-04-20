"use client";

import { useState, useRef } from "react";
import { HiOutlineCloudArrowUp, HiOutlineTrash } from "react-icons/hi2";
import { compressImage } from "@/lib/client-image-compress";

function isManagedUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return true;
  if (url.includes("/storage/v1/object/public/")) return true;
  return false;
}

async function deleteFromStorage(url: string): Promise<void> {
  if (!isManagedUrl(url)) return;

  try {
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch (error) {
    console.error("Failed to delete from storage:", error);
  }
}

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUploadButton({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");

    try {
      const { blob, name } = await compressImage(file);

      const formData = new FormData();
      formData.append("file", blob, name);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed:", data);
        setError(data.error ?? "Upload failed");
        return;
      }

      onChange(data.url);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleUpload(file);
  }

  async function handleRemove() {
    if (value) {
      await deleteFromStorage(value);
    }
    onChange("");
  }

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</span>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or upload below"
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border-soft)" }}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
        <div
          className="flex shrink-0 flex-col items-center justify-center rounded-lg border px-3 py-3 text-center transition hover:opacity-80"
          style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(74,101,68,0.04)", minWidth: "90px" }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
          ) : (
            <>
              <HiOutlineCloudArrowUp className="h-5 w-5" style={{ color: "var(--primary)" }} />
              <span className="mt-1 text-[0.6rem] font-bold uppercase" style={{ color: "var(--muted)" }}>Upload</span>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
      {value && (
        <div className="relative mt-2 inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-28 rounded-lg border object-cover"
            style={{ borderColor: "var(--border-soft)" }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
          >
            <HiOutlineTrash className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

type MultiImageUploadProps = {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
};

export function MultiImageUploadButton({ values, onChange, label = "Photos" }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");

    try {
      const { blob, name } = await compressImage(file);

      const formData = new FormData();
      formData.append("file", blob, name);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed:", data);
        setError(data.error ?? "Upload failed");
        return;
      }

      onChange([...values, data.url]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeAt(index: number) {
    const url = values[index];
    if (url) {
      await deleteFromStorage(url);
    }
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="block sm:col-span-2">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</span>
      {error && <p className="mb-1 text-xs text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {values.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} alt={`Photo ${i + 1}`} className="h-20 w-28 rounded-lg border object-cover" style={{ borderColor: "var(--border-soft)" }} />
            <button type="button" onClick={() => removeAt(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
              <HiOutlineTrash className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div
          className="flex h-20 w-28 flex-col items-center justify-center rounded-lg border transition hover:opacity-80"
          style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(74,101,68,0.04)" }}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
          ) : (
            <>
              <HiOutlineCloudArrowUp className="h-5 w-5" style={{ color: "var(--muted)" }} />
              <span className="mt-1 text-[0.55rem] font-bold uppercase" style={{ color: "var(--muted)" }}>Add Photo</span>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
