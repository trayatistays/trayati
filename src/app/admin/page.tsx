"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  featuredStays as initialStays,
  type FeaturedStay,
} from "@/data/featured-stays";

// ─── Helpers ──────────────────────────────────────────────────────
function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Shared Input ─────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const shared =
    "w-full rounded-[0.9rem] px-4 py-3 text-sm outline-none transition";
  const sty = {
    backgroundColor: "rgba(8,22,50,0.9)",
    border: "1px solid rgba(80,150,220,0.5)",
    color: "#E5E7EB",
  };
  return (
    <label className="block">
      <span
        className="block text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-1.5"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-none`}
          style={sty}
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
          style={sty}
        />
      )}
    </label>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────
function ModalWrapper({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(3,11,22,0.88)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-[2rem] border p-6 sm:p-8 max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          borderColor: "rgba(80,150,220,0.3)",
          backgroundColor: "rgba(6,16,40,0.98)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 50px 120px rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-5 shrink-0">
          {title && (
            <h3 className="font-display text-xl font-bold tracking-[-0.03em]">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto flex size-9 items-center justify-center rounded-full text-sm transition"
            style={{
              backgroundColor: "rgba(80,150,220,0.25)",
              color: "#E5E7EB",
            }}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────
function ViewModal({
  stay,
  onClose,
}: {
  stay: FeaturedStay;
  onClose: () => void;
}) {
  return (
    <ModalWrapper title={stay.title} onClose={onClose}>
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative shrink-0 w-full sm:w-44 aspect-[4/5] overflow-hidden rounded-[1.25rem]">
          <Image src={stay.image} alt={stay.alt} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start gap-3 justify-between">
            <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>
              {stay.subtitle}
            </p>
            <span
              className="shrink-0 rounded-full px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: "rgba(200,144,26,0.18)",
                color: "var(--gold)",
              }}
            >
              {stay.tag}
            </span>
          </div>
          <p className="text-sm leading-6" style={{ color: "var(--foreground-soft)" }}>
            {stay.description}
          </p>
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            {[
              ["Type", stay.type],
              ["Rating", `★ ${stay.rating.toFixed(1)}`],
              ["Price", `${formatPrice(stay.pricePerNight)} / night`],
              ["PIN", stay.pin],
              ["City", stay.city],
              ["State / Country", `${stay.state}, ${stay.country}`],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-[0.9rem] px-3 py-2.5"
                style={{
                  backgroundColor: "rgba(10,26,58,0.7)",
                  border: "1px solid rgba(80,150,220,0.3)",
                }}
              >
                <p
                  className="text-[0.58rem] uppercase tracking-[0.22em] font-bold mb-0.5"
                  style={{ color: "var(--muted)" }}
                >
                  {k}
                </p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <div
            className="rounded-[0.9rem] px-3 py-2.5 text-sm"
            style={{
              backgroundColor: "rgba(10,26,58,0.7)",
              border: "1px solid rgba(80,150,220,0.3)",
            }}
          >
            <p
              className="text-[0.58rem] uppercase tracking-[0.22em] font-bold mb-0.5"
              style={{ color: "var(--muted)" }}
            >
              Address
            </p>
            <p>{stay.address}</p>
          </div>
          {stay.googleMapsUrl && (
            <a
              href={stay.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
              style={{ color: "var(--aqua)" }}
            >
              View on Google Maps ↗
            </a>
          )}
          <div>
            <p
              className="text-[0.6rem] uppercase tracking-[0.22em] font-bold mb-2"
              style={{ color: "var(--muted)" }}
            >
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {stay.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(30,109,191,0.35)",
                    color: "#D1D5DB",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────
function EditModal({
  stay,
  onSave,
  onClose,
}: {
  stay: FeaturedStay;
  onSave: (s: FeaturedStay) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FeaturedStay>({ ...stay });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: keyof FeaturedStay, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <ModalWrapper title="Edit Stay" onClose={onClose}>
      <div className="space-y-6 pr-1 max-h-[calc(90vh-120px)] overflow-y-auto">
        {/* Basic Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Basic Information
          </p>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Property Name" value={form.title} onChange={(v) => set("title", v)} />
              <Field label="Subtitle" value={form.subtitle} onChange={(v) => set("subtitle", v)} />
              <Field label="Type" value={form.type} onChange={(v) => set("type", v)} />
              <Field label="Tag" value={form.tag} onChange={(v) => set("tag", v)} />
              <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
              <Field label="State" value={form.state} onChange={(v) => set("state", v)} />
              <Field label="Country" value={form.country} onChange={(v) => set("country", v)} />
              <Field label="PIN Code" value={form.pin} onChange={(v) => set("pin", v)} />
              <Field label="Rating (0–5)" value={form.rating} onChange={(v) => set("rating", Number(v))} type="number" />
              <Field label="Base Price (₹)" value={form.basePrice || form.pricePerNight} onChange={(v) => set("basePrice", Number(v))} type="number" />
            </div>
            <Field label="Address" value={form.address} onChange={(v) => set("address", v)} />
            <Field label="Location Display" value={form.location} onChange={(v) => set("location", v)} />
            <Field label="Google Maps URL" value={form.googleMapsUrl ?? ""} onChange={(v) => set("googleMapsUrl", v)} />
            <Field label="Description" value={form.description} onChange={(v) => set("description", v)} multiline />
          </div>
        </div>

        {/* Photos */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Photo URLs
          </p>
          <div className="space-y-2">
            {form.photos.map((photo, idx) => (
              <Field
                key={idx}
                label={`Photo ${idx + 1} URL`}
                value={photo}
                onChange={(v) => {
                  const newPhotos = [...form.photos];
                  newPhotos[idx] = v;
                  set("photos", newPhotos);
                }}
              />
            ))}
            <button
              onClick={() => set("photos", [...form.photos, ""])}
              className="text-xs font-semibold uppercase tracking-[0.18em] px-3 py-2 rounded"
              style={{
                backgroundColor: "rgba(30,109,191,0.35)",
                color: "#D1D5DB",
              }}
            >
              + Add Photo URL
            </button>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Amenities
          </p>
          <div className="space-y-3">
            {/* Basic Amenities List */}
            <div>
              <Field
                label="Amenities (comma separated)"
                value={form.amenities.join(", ")}
                onChange={(v) => set("amenities", v.split(",").map((s) => s.trim()).filter(Boolean))}
                multiline
              />
            </div>

            {/* Amenities Checkboxes */}
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(form.amenitiesDetail).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded text-xs"
                  style={{
                    backgroundColor: "rgba(10,26,58,0.7)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.amenitiesDetail[key as keyof typeof form.amenitiesDetail]}
                    onChange={(e) => {
                      set("amenitiesDetail", {
                        ...form.amenitiesDetail,
                        [key]: e.target.checked,
                      });
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Options */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Meal Options
          </p>
          <div className="space-y-3">
            {form.mealOptions.map((meal, idx) => (
              <div key={idx} className="rounded-[0.9rem] p-3" style={{ backgroundColor: "rgba(10,26,58,0.7)" }}>
                <label className="flex items-center gap-2 mb-3 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meal.available}
                    onChange={(e) => {
                      const newMeals = [...form.mealOptions];
                      newMeals[idx].available = e.target.checked;
                      set("mealOptions", newMeals);
                    }}
                    className="rounded"
                  />
                  <span className="font-semibold capitalize">{meal.type}</span>
                </label>
                {meal.available && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={meal.price || ""}
                      onChange={(e) => {
                        const newMeals = [...form.mealOptions];
                        newMeals[idx].price = Number(e.target.value);
                        set("mealOptions", newMeals);
                      }}
                      className="w-full px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: "rgba(8,22,50,0.9)",
                        border: "1px solid rgba(80,150,220,0.5)",
                        color: "#E5E7EB",
                      }}
                    />
                    <textarea
                      placeholder="Description"
                      value={meal.description || ""}
                      onChange={(e) => {
                        const newMeals = [...form.mealOptions];
                        newMeals[idx].description = e.target.value;
                        set("mealOptions", newMeals);
                      }}
                      className="w-full px-2 py-1 rounded text-xs resize-none"
                      rows={2}
                      style={{
                        backgroundColor: "rgba(8,22,50,0.9)",
                        border: "1px solid rgba(80,150,220,0.5)",
                        color: "#E5E7EB",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cloudinary Note */}
        <div
          className="rounded-[0.9rem] px-4 py-3 text-xs"
          style={{
            backgroundColor: "rgba(200,144,26,0.08)",
            border: "1px solid rgba(200,144,26,0.2)",
            color: "var(--gold)",
          }}
        >
          <strong>Cloudinary Integration:</strong> Image uploads will be connected to Cloudinary. Photo URLs can be placeholder paths for now.
        </div>
      </div>

      <div
        className="flex gap-3 mt-5 pt-5 border-t shrink-0"
        style={{ borderColor: "rgba(80,150,220,0.3)" }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSave(form)}
          className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.2em] text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Save Changes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
          style={{
            backgroundColor: "rgba(10,26,58,0.9)",
            border: "1px solid rgba(80,150,220,0.4)",
            color: "#E5E7EB",
          }}
        >
          Cancel
        </motion.button>
      </div>
    </ModalWrapper>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────
function DeleteConfirm({
  stay,
  onConfirm,
  onClose,
}: {
  stay: FeaturedStay;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalWrapper title="Delete Stay" onClose={onClose}>
      <div className="text-center py-4">
        <div
          className="size-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: "rgba(220,38,38,0.2)",
            border: "1px solid rgba(220,38,38,0.4)",
          }}
        >
          <span className="text-2xl">🗑</span>
        </div>
        <p className="font-display text-lg font-bold">Delete &ldquo;{stay.title}&rdquo;?</p>
        <p className="mt-2 text-sm" style={{ color: "var(--foreground-soft)" }}>
          This action cannot be undone. The stay will be removed from the featured list.
        </p>
      </div>
      <div className="flex gap-3 mt-5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.2em] text-white"
          style={{ backgroundColor: "rgba(220,38,38,0.85)" }}
        >
          Yes, Delete
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="flex-1 rounded-full py-3 text-sm font-semibold uppercase tracking-[0.18em]"
          style={{
            backgroundColor: "rgba(10,26,58,0.9)",
            border: "1px solid rgba(80,150,220,0.4)",
            color: "#E5E7EB",
          }}
        >
          Cancel
        </motion.button>
      </div>
    </ModalWrapper>
  );
}

// ─── Admin Stay Card ──────────────────────────────────────────────
function AdminStayCard({
  stay,
  onView,
  onEdit,
  onDelete,
}: {
  stay: FeaturedStay;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-[1.6rem] border overflow-hidden"
      style={{
        borderColor: "rgba(80,150,220,0.12)",
        backgroundColor: "rgba(8,20,46,0.8)",
      }}
    >
      <div className="grid sm:grid-cols-[130px_1fr]">
        <div className="relative aspect-[4/3] sm:aspect-[4/4.8] overflow-hidden">
          <Image src={stay.image} alt={stay.alt} fill className="object-cover" sizes="200px" />
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-display text-lg font-bold tracking-[-0.03em] leading-tight">
                {stay.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {stay.city}, {stay.state}
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: "rgba(200,144,26,0.18)",
                color: "var(--gold)",
              }}
            >
              {stay.tag}
            </span>
          </div>

          <p
            className="text-xs leading-5 line-clamp-2"
            style={{ color: "var(--foreground-soft)" }}
          >
            {stay.description}
          </p>

          <div className="flex gap-2 text-xs flex-wrap">
            <span
              className="rounded-full px-3 py-1.5 font-semibold"
              style={{ backgroundColor: "rgba(30,109,191,0.35)", color: "#D1D5DB" }}
            >
              ★ {stay.rating.toFixed(1)}
            </span>
            <span
              className="rounded-full px-3 py-1.5 font-semibold"
              style={{ backgroundColor: "rgba(53,192,196,0.25)", color: "#D1D5DB" }}
            >
              {formatPrice(stay.pricePerNight)}/night
            </span>
          </div>

          <div className="flex gap-2 mt-auto pt-1">
            {(
              [
                { label: "View", action: onView, bg: "rgba(10,26,58,0.9)", col: "#E5E7EB" },
                { label: "Edit", action: onEdit, bg: "rgba(30,109,191,0.45)", col: "#E5E7EB" },
                { label: "Delete", action: onDelete, bg: "rgba(220,38,38,0.25)", col: "#FECACA" },
              ] as const
            ).map(({ label, action, bg, col }) => (
              <motion.button
                key={label}
                onClick={action}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full px-4 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em]"
                style={{
                  backgroundColor: bg,
                  border: "1px solid rgba(80,150,220,0.25)",
                  color: col,
                }}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────
function LoginScreen({
  onLogin,
}: {
  onLogin: (u: string, p: string) => boolean;
}) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    await new Promise((r) => setTimeout(r, 700));
    if (!onLogin(u, p)) setErr("Invalid credentials. Try admin / admin.");
    setLoading(false);
  };

  const inputSty = {
    backgroundColor: "rgba(8,22,50,0.95)",
    border: "1px solid rgba(80,150,220,0.5)",
    color: "#E5E7EB",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(160deg, #FAF7F0 0%, #F5F1E8 55%, #EEE9DD 100%)",
      }}
    >
      <div
        className="pointer-events-none fixed left-1/4 top-1/4 size-72 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: "rgba(95, 168, 168, 0.28)" }}
      />
      <div
        className="pointer-events-none fixed right-1/4 bottom-1/4 size-56 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "rgba(164, 106, 45, 0.22)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px] rounded-[2rem] border p-8 sm:p-10"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245, 241, 232, 0.95)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 40px 100px rgba(32,60,76,0.16)",
        }}
      >
        <div className="flex flex-col items-center gap-4 mb-10">
          <div
            className="size-16 overflow-hidden rounded-full border-2"
            style={{
              borderColor: "rgba(200,144,26,0.45)",
              boxShadow: "0 0 40px rgba(30,109,191,0.45)",
            }}
          >
            <Image
              src="/trayati-logo.jpg"
              alt="Trayati"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold tracking-[-0.03em]">
              Trayati Admin
            </p>
            <p
              className="text-xs uppercase tracking-[0.26em] mt-1"
              style={{ color: "var(--muted)" }}
            >
              Dashboard Access
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={u}
              onChange={(e) => setU(e.target.value)}
              required
              placeholder="admin"
              className="w-full rounded-[1rem] px-4 py-3.5 text-sm outline-none transition"
              style={inputSty}
            />
          </div>
          <div>
            <label
              className="block text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-[1rem] px-4 py-3.5 text-sm outline-none transition"
              style={inputSty}
            />
          </div>

          <AnimatePresence>
            {err && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-center py-2 rounded-xl"
                style={{ color: "#f87171", backgroundColor: "rgba(220,38,38,0.1)" }}
              >
                {err}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-[1rem] py-4 text-sm font-bold uppercase tracking-[0.22em] text-white mt-1 disabled:opacity-60"
            style={{
              backgroundColor: "var(--cta)",
              boxShadow: "0 18px 44px rgba(199,91,26,0.40)",
            }}
          >
            {loading ? "Authenticating…" : "Access Dashboard"}
          </motion.button>
        </form>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] transition hover:opacity-80"
            style={{ color: "var(--muted)" }}
          >
            ← Back to public site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Stay Modal ────────────────────────────────────────────────
function AddStayModal({
  onSave,
  onClose,
}: {
  onSave: (s: FeaturedStay) => void;
  onClose: () => void;
}) {
  // eslint-disable-next-line react-hooks/purity
  const generateInitialId = () => `stay-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  const [form, setForm] = useState<FeaturedStay>({
    id: generateInitialId(),
    title: "",
    subtitle: "Trayati Stays",
    location: "",
    city: "",
    state: "",
    country: "India",
    pin: "",
    address: "",
    description: "",
    rating: 4.8,
    pricePerNight: 10000,
    basePrice: 10000,
    image: "/property-exterior.jpg",
    alt: "New property",
    tag: "Luxury Stay",
    type: "Private Villa",
    amenities: [],
    photos: ["/property-exterior.jpg"],
    roomTypes: [
      {
        id: "room-1",
        name: "Standard Room",
        category: "Standard",
        units: 1,
        bedConfiguration: "Queen bed",
        bathroom: "Attached bathroom",
        pricePerNight: 10000,
        maxOccupancy: 2,
      },
    ],
    amenitiesDetail: {
      parking: true,
      heaterOnRequest: false,
      tv: true,
      fridge: true,
      washingMachine: false,
      powerBackup: true,
      airConditioning: true,
      geyser: true,
      kitchen: false,
      garden: false,
      balcony: true,
      lounge: false,
      studyArea: false,
      fireplace: false,
      pool: false,
      spa: false,
    },
    mealOptions: [
      { type: "breakfast", available: false, price: 0, description: "" },
      { type: "lunch", available: false, price: 0, description: "" },
      { type: "dinner", available: false, price: 0, description: "" },
    ],
    cancellationPolicies: [
      {
        name: "Flexible",
        description: "Free cancellation",
        refundPercentage: 100,
        daysBeforeCheckin: 7,
      },
    ],
    googleMapsUrl: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: keyof FeaturedStay, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <ModalWrapper title="Add New Stay" onClose={onClose}>
      <div className="space-y-6 pr-1 max-h-[calc(90vh-120px)] overflow-y-auto">
        {/* Basic Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Basic Information
          </p>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Property Name" value={form.title} onChange={(v) => set("title", v)} />
              <Field label="Subtitle" value={form.subtitle} onChange={(v) => set("subtitle", v)} />
              <Field label="Type" value={form.type} onChange={(v) => set("type", v)} />
              <Field label="Tag" value={form.tag} onChange={(v) => set("tag", v)} />
              <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
              <Field label="State" value={form.state} onChange={(v) => set("state", v)} />
              <Field label="Country" value={form.country} onChange={(v) => set("country", v)} />
              <Field label="PIN Code" value={form.pin} onChange={(v) => set("pin", v)} />
              <Field label="Rating (0–5)" value={form.rating} onChange={(v) => set("rating", Number(v))} type="number" />
              <Field label="Base Price (₹)" value={form.basePrice} onChange={(v) => set("basePrice", Number(v))} type="number" />
            </div>
            <Field label="Location Display" value={form.location} onChange={(v) => set("location", v)} />
            <Field label="Address" value={form.address} onChange={(v) => set("address", v)} />
            <Field label="Google Maps URL" value={form.googleMapsUrl ?? ""} onChange={(v) => set("googleMapsUrl", v)} />
            <Field label="Description" value={form.description} onChange={(v) => set("description", v)} multiline />
          </div>
        </div>

        {/* Photos */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Photo URLs
          </p>
          <div className="space-y-2">
            {form.photos.map((photo, idx) => (
              <Field
                key={idx}
                label={`Photo ${idx + 1} URL`}
                value={photo}
                onChange={(v) => {
                  const newPhotos = [...form.photos];
                  newPhotos[idx] = v;
                  set("photos", newPhotos);
                }}
              />
            ))}
            <button
              onClick={() => set("photos", [...form.photos, ""])}
              className="text-xs font-semibold uppercase tracking-[0.18em] px-3 py-2 rounded"
              style={{
                backgroundColor: "rgba(30,109,191,0.35)",
                color: "#D1D5DB",
              }}
            >
              + Add Photo URL
            </button>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Amenities
          </p>
          <div className="space-y-3">
            {/* Basic Amenities List */}
            <div>
              <Field
                label="Amenities (comma separated)"
                value={form.amenities.join(", ")}
                onChange={(v) => set("amenities", v.split(",").map((s) => s.trim()).filter(Boolean))}
                multiline
              />
            </div>

            {/* Amenities Checkboxes */}
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(form.amenitiesDetail).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded text-xs"
                  style={{
                    backgroundColor: "rgba(10,26,58,0.7)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.amenitiesDetail[key as keyof typeof form.amenitiesDetail]}
                    onChange={(e) => {
                      set("amenitiesDetail", {
                        ...form.amenitiesDetail,
                        [key]: e.target.checked,
                      });
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Options */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>
            Meal Options
          </p>
          <div className="space-y-3">
            {form.mealOptions.map((meal, idx) => (
              <div key={idx} className="rounded-[0.9rem] p-3" style={{ backgroundColor: "rgba(10,26,58,0.7)" }}>
                <label className="flex items-center gap-2 mb-3 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meal.available}
                    onChange={(e) => {
                      const newMeals = [...form.mealOptions];
                      newMeals[idx].available = e.target.checked;
                      set("mealOptions", newMeals);
                    }}
                    className="rounded"
                  />
                  <span className="font-semibold capitalize">{meal.type}</span>
                </label>
                {meal.available && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={meal.price || ""}
                      onChange={(e) => {
                        const newMeals = [...form.mealOptions];
                        newMeals[idx].price = Number(e.target.value);
                        set("mealOptions", newMeals);
                      }}
                      className="w-full px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: "rgba(8,22,50,0.9)",
                        border: "1px solid rgba(80,150,220,0.5)",
                        color: "#E5E7EB",
                      }}
                    />
                    <textarea
                      placeholder="Description"
                      value={meal.description || ""}
                      onChange={(e) => {
                        const newMeals = [...form.mealOptions];
                        newMeals[idx].description = e.target.value;
                        set("mealOptions", newMeals);
                      }}
                      className="w-full px-2 py-1 rounded text-xs resize-none"
                      rows={2}
                      style={{
                        backgroundColor: "rgba(8,22,50,0.9)",
                        border: "1px solid rgba(80,150,220,0.5)",
                        color: "#E5E7EB",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cloudinary Note */}
        <div
          className="rounded-[0.9rem] px-4 py-3 text-xs"
          style={{
            backgroundColor: "rgba(200,144,26,0.08)",
            border: "1px solid rgba(200,144,26,0.2)",
            color: "var(--gold)",
          }}
        >
          <strong>Cloudinary Integration:</strong> Image uploads will be connected to Cloudinary. Photo URLs can be placeholder paths for now.
        </div>
      </div>

      <div
        className="flex gap-3 mt-5 pt-5 border-t shrink-0"
        style={{ borderColor: "rgba(80,150,220,0.3)" }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSave(form)}
          className="flex-1 rounded-full py-3 text-sm font-bold uppercase tracking-[0.2em] text-white"
          style={{ backgroundColor: "var(--cta)" }}
        >
          Create Stay
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
          style={{
            backgroundColor: "rgba(10,26,58,0.9)",
            border: "1px solid rgba(80,150,220,0.4)",
            color: "#E5E7EB",
          }}
        >
          Cancel
        </motion.button>
      </div>
    </ModalWrapper>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────
function AdminDashboard({
  stays,
  onLogout,
  onView,
  onEdit,
  onDelete,
  onAdd,
  viewStay,
  editStay,
  deleteStay,
  addStay,
  onDeleteConfirm,
  onEditSave,
  onAddSave,
  onCloseModals,
}: {
  stays: FeaturedStay[];
  onLogout: () => void;
  onView: (s: FeaturedStay) => void;
  onEdit: (s: FeaturedStay) => void;
  onDelete: (s: FeaturedStay) => void;
  onAdd: (v: boolean) => void;
  viewStay: FeaturedStay | null;
  editStay: FeaturedStay | null;
  deleteStay: FeaturedStay | null;
  addStay: boolean;
  onDeleteConfirm: (id: string) => void;
  onEditSave: (s: FeaturedStay) => void;
  onAddSave: (s: FeaturedStay) => void;
  onCloseModals: () => void;
}) {
  const avgRating = stays.length
    ? (stays.reduce((s, x) => s + x.rating, 0) / stays.length).toFixed(1)
    : "—";
  const avgPrice = stays.length
    ? formatPrice(Math.round(stays.reduce((s, x) => s + x.pricePerNight, 0) / stays.length))
    : "—";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #030b16 0%, #060e1a 55%, #08111e 100%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-5 sm:px-8 py-4 flex items-center justify-between gap-4"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245, 241, 232, 0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="size-10 overflow-hidden rounded-full border"
            style={{ borderColor: "rgba(200,144,26,0.3)" }}
          >
            <Image
              src="/trayati-logo.jpg"
              alt="Trayati"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-display text-base font-bold tracking-[-0.02em] leading-tight">
              Trayati Admin
            </p>
            <p
              className="text-[0.58rem] uppercase tracking-[0.22em]"
              style={{ color: "var(--muted)" }}
            >
              Dashboard
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:opacity-80"
            style={{
              border: "1px solid var(--border-soft)",
              backgroundColor: "rgba(237, 233, 222, 0.9)",
              color: "var(--primary)",
            }}
          >
            ← Public Site
          </Link>
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{
              backgroundColor: "rgba(220,38,38,0.14)",
              border: "1px solid rgba(220,38,38,0.24)",
              color: "#f87171",
            }}
          >
            Logout
          </motion.button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        {/* Page title */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.38em] mb-2"
              style={{ color: "var(--gold)" }}
            >
              Featured Stays
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.04em]">
              Stay Management
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--foreground-soft)" }}>
              {stays.length} {stays.length === 1 ? "property" : "properties"} ·
              Session changes only
            </p>
          </div>
          <motion.button
            onClick={() => onAdd(true)}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-[0.2em] text-white"
            style={{
              backgroundColor: "var(--cta)",
              boxShadow: "0 14px 36px rgba(199,91,26,0.38)",
            }}
          >
            + Add Stay
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Properties", value: stays.length },
            { label: "Avg Rating", value: avgRating },
            { label: "Avg / Night", value: avgPrice },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[1.4rem] border px-4 py-4 text-center"
              style={{
                borderColor: "rgba(80,150,220,0.12)",
                backgroundColor: "rgba(8,20,46,0.7)",
              }}
            >
              <p className="font-display text-2xl font-bold tracking-[-0.04em]">
                {value}
              </p>
              <p
                className="mt-1 text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--muted)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Stays list */}
        {stays.length === 0 ? (
          <div
            className="rounded-[2rem] border px-8 py-16 text-center"
            style={{
              borderColor: "rgba(80,150,220,0.12)",
              backgroundColor: "rgba(8,20,46,0.5)",
            }}
          >
            <p className="text-3xl mb-3">🏡</p>
            <p className="font-display text-lg font-bold">No stays yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--foreground-soft)" }}>
              Add your first featured stay to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {stays.map((stay) => (
              <AdminStayCard
                key={stay.id}
                stay={stay}
                onView={() => onView(stay)}
                onEdit={() => onEdit(stay)}
                onDelete={() => onDelete(stay)}
              />
            ))}
          </div>
        )}

        {/* Backend note */}
        <div
          className="mt-8 rounded-[1.4rem] border px-5 py-4 text-sm leading-6"
          style={{
            borderColor: "rgba(200,144,26,0.2)",
            backgroundColor: "rgba(200,144,26,0.06)",
            color: "var(--foreground-soft)",
          }}
        >
          <span style={{ color: "var(--gold)", fontWeight: 700 }}>
            Backend Note:{" "}
          </span>
          All changes are session-only. Connect Supabase + Cloudinary to enable
          persistent edits, image uploads, and real-time sync.
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {viewStay && (
          <ViewModal key="view" stay={viewStay} onClose={onCloseModals} />
        )}
        {editStay && (
          <EditModal
            key="edit"
            stay={editStay}
            onSave={onEditSave}
            onClose={onCloseModals}
          />
        )}
        {deleteStay && (
          <DeleteConfirm
            key="delete"
            stay={deleteStay}
            onConfirm={() => onDeleteConfirm(deleteStay.id)}
            onClose={onCloseModals}
          />
        )}
        {addStay && (
          <AddStayModal
            key="add"
            onSave={onAddSave}
            onClose={onCloseModals}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stays, setStays] = useState<FeaturedStay[]>(initialStays);
  const [viewStay, setViewStay] = useState<FeaturedStay | null>(null);
  const [editStay, setEditStay] = useState<FeaturedStay | null>(null);
  const [deleteStay, setDeleteStay] = useState<FeaturedStay | null>(null);
  const [addStay, setAddStay] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("trayati_admin") === "true";
    // Batch both updates in one render cycle
    Promise.resolve().then(() => {
      setMounted(true);
      if (isAdmin) setLoggedIn(true);
    });
  }, []);

  const handleLogin = (u: string, p: string) => {
    if (u === "admin" && p === "admin") {
      localStorage.setItem("trayati_admin", "true");
      setLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("trayati_admin");
    setLoggedIn(false);
  };

  const closeModals = () => {
    setViewStay(null);
    setEditStay(null);
    setDeleteStay(null);
    setAddStay(false);
  };

  if (!mounted) return null;
  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <AdminDashboard
      stays={stays}
      onLogout={handleLogout}
      onView={setViewStay}
      onEdit={setEditStay}
      onDelete={setDeleteStay}
      onAdd={setAddStay}
      viewStay={viewStay}
      editStay={editStay}
      deleteStay={deleteStay}
      addStay={addStay}
      onDeleteConfirm={(id) => {
        setStays((prev) => prev.filter((s) => s.id !== id));
        setDeleteStay(null);
      }}
      onEditSave={(updated) => {
        setStays((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setEditStay(null);
      }}
      onAddSave={(newStay) => {
        setStays((prev) => [newStay, ...prev]);
        setAddStay(false);
      }}
      onCloseModals={closeModals}
    />
  );
}
