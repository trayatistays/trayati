"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineChatBubbleLeftRight,
  HiOutlineNewspaper,
  HiOutlineInbox,
  HiOutlineCalendarDays,
  HiOutlineEnvelope,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineChevronDown,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
} from "react-icons/hi2";
import { ImageUploadButton, MultiImageUploadButton } from "@/components/admin/image-upload-button";
import { BookingSourcesPanel } from "@/components/admin/booking-sources-panel";

type Tab = "overview" | "stays" | "testimonials" | "experiences" | "submissions" | "reservations" | "messages" | "promocodes" | "hosts" | "commissions" | "reviews";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: HiOutlineHome },
  { id: "stays", label: "Stays", icon: HiOutlineBuildingOffice2 },
  { id: "reservations", label: "Bookings", icon: HiOutlineCalendarDays },
  { id: "hosts", label: "Hosts", icon: HiOutlineUsers },
  { id: "commissions", label: "Commissions", icon: HiOutlineCurrencyDollar },
  { id: "promocodes", label: "Promo Codes", icon: HiOutlineTag },
  { id: "reviews", label: "Reviews", icon: HiOutlineStar },
  { id: "testimonials", label: "Testimonials", icon: HiOutlineChatBubbleLeftRight },
  { id: "experiences", label: "Blogs", icon: HiOutlineNewspaper },
  { id: "submissions", label: "Submissions", icon: HiOutlineInbox },
  { id: "messages", label: "Messages", icon: HiOutlineEnvelope },
];

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => { setIsAuth(d.authenticated === true); setChecking(false); })
      .catch(() => { setChecking(false); });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const d = await api<{ authenticated: boolean }>("/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setIsAuth(d.authenticated);
    } catch {
      setLoginError("Invalid credentials");
    }
  }

  async function handleLogout() {
    await api("/api/admin/session", { method: "DELETE" });
    setIsAuth(false);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border p-8" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.95)" }}>
          <h1 className="mb-2 font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>Admin Panel</h1>
          <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>Sign in to manage your content</p>
          {loginError && <p className="mb-4 text-sm font-medium text-red-600">{loginError}</p>}
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-3 w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-6 w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
          <button type="submit" className="w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider text-white" style={{ backgroundColor: "var(--primary)" }}>Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <aside className={`shrink-0 border-r transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"}`} style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.98)" }}>
        <div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: "var(--border-soft)" }}>
          {sidebarOpen && <span className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>Trayati Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-1.5 transition hover:opacity-70" style={{ color: "var(--muted)" }}>
            <HiOutlineChevronDown className={`h-4 w-4 transition ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
        <nav className="mt-2 space-y-1 px-2">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition" style={{ color: activeTab === tab.id ? "var(--primary)" : "var(--muted)", backgroundColor: activeTab === tab.id ? "rgba(74,101,68,0.08)" : "transparent" }}>
              <tab.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-2">
          <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:opacity-70" style={{ color: "var(--muted)" }}>
            <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "stays" && <StaysTab />}
            {activeTab === "reservations" && <ReservationsTab />}
            {activeTab === "hosts" && <HostsTab />}
            {activeTab === "commissions" && <CommissionsTab />}
            {activeTab === "promocodes" && <PromoCodesTab />}
            {activeTab === "reviews" && <ReviewsTab />}
            {activeTab === "testimonials" && <TestimonialsTab />}
            {activeTab === "experiences" && <ExperiencesTab />}
            {activeTab === "submissions" && <SubmissionsTab />}
            {activeTab === "messages" && <MessagesTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({ stays: 0, testimonials: 0, experiences: 0, submissions: 0, reservations: 0, messages: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/stays").then((r) => r.json()).catch(() => ({ stays: [] })),
      fetch("/api/testimonials").then((r) => r.json()).catch(() => ({ testimonials: [] })),
      fetch("/api/experiences").then((r) => r.json()).catch(() => ({ experiences: [] })),
      fetch("/api/admin/submissions").then((r) => r.json()).catch(() => ({ submissions: [] })),
      fetch("/api/admin/reservations").then((r) => r.json()).catch(() => ({ reservations: [] })),
      fetch("/api/contact").then((r) => r.json()).catch(() => ({ submissions: [] })),
    ]).then(([s, t, e, sub, res, msg]) => {
      setStats({ stays: s.stays?.length ?? 0, testimonials: t.testimonials?.length ?? 0, experiences: e.experiences?.length ?? 0, submissions: sub.submissions?.length ?? 0, reservations: res.reservations?.length ?? 0, messages: msg.submissions?.length ?? 0 });
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active Stays" value={stats.stays} color="var(--primary)" />
        <StatCard label="Testimonials" value={stats.testimonials} color="var(--cta)" />
        <StatCard label="Blog Posts" value={stats.experiences} color="var(--secondary)" />
        <StatCard label="Pending Submissions" value={stats.submissions} color="#D82323" />
        <StatCard label="Reservations" value={stats.reservations} color="var(--primary)" />
        <StatCard label="Messages" value={stats.messages} color="var(--cta)" />
      </div>
    </div>
  );
}

function StaysTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/content/stays").then((r) => r.json()).then((d) => { setItems(d.items ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/content/stays").then((r) => r.json()).then((d) => { setItems(d.items ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this stay?")) return;
    await api(`/api/admin/content/stays/${id}`, { method: "DELETE" });
    load();
  }

  async function handleSave(data: Record<string, unknown>) {
    if (editing) {
      await api(`/api/admin/content/stays/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
    } else {
      await api("/api/admin/content/stays", { method: "POST", body: JSON.stringify(data) });
    }
    setEditing(null);
    setCreating(false);
    load();
  }

  if (creating || editing) {
    return <StayForm initial={editing} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null); }} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Stays</h1>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
          <HiOutlinePlus className="h-4 w-4" /> Add Stay
        </button>
      </div>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id as string} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--background-soft)" }}>
                <Image src={(item.image as string) || "/trayati-logo.jpg"} alt={(item.title as string) || ""} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold" style={{ color: "var(--foreground)" }}>{item.title as string}</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{item.city as string}, {item.state as string}</p>
                <p className="text-xs" style={{ color: "var(--cta)" }}>&#8377;{item.pricePerNight as number}/night &middot; {item.experienceType as string}</p>
                {(item.isFeatured as boolean) && (
                  <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--primary)" }}>
                    Featured On Homepage
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditing(item)} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlinePencil className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(item.id as string)} className="rounded-lg p-2 text-red-500 transition hover:opacity-70"><HiOutlineTrash className="h-5 w-5" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No stays found. Add your first stay or run the seed script.</p>}
        </div>
      )}
    </div>
  );
}

function StayForm({ initial, onSave, onCancel }: { initial: Record<string, unknown> | null; onSave: (data: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, unknown>>(initial ?? {
    id: `stay-${Date.now()}`, title: "", subtitle: "Trayati Stays", location: "", city: "", state: "", country: "India",
    pin: "", address: "", googleMapsUrl: "", description: "", rating: 0, pricePerNight: 0,
    basePrice: 0, image: "", alt: "", tag: "", type: "", experienceType: "Folklore Homestays",
    isFeatured: false, bookingLink: "",
    amenities: [], photos: [], roomTypes: [], amenitiesDetail: {
      parking: false, heaterOnRequest: false, tv: false, fridge: false, washingMachine: false,
      powerBackup: false, airConditioning: false, geyser: false, kitchen: false, garden: false,
      balcony: false, lounge: false, studyArea: false, fireplace: false, pool: false, spa: false,
    }, mealOptions: [], cancellationPolicies: [],
    pricingConfig: {
      cleaningFeeType: "percentage",
      cleaningFeeValue: 15,
      serviceFeeType: "percentage",
      serviceFeeValue: 5,
      gstPercentage: 18,
      extraGuestFee: 0,
      extraGuestThreshold: 2,
    },
  });
  const [saving, setSaving] = useState(false);

  function update(key: string, value: unknown) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>{initial ? "Edit Stay" : "New Stay"}</h1>
        <button type="button" onClick={onCancel} className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Cancel</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "title", label: "Title *" }, { key: "subtitle", label: "Subtitle *" },
          { key: "location", label: "Location *" }, { key: "tag", label: "Tag *" },
          { key: "city", label: "City *" }, { key: "state", label: "State *" },
          { key: "pin", label: "Pin Code *" }, { key: "country", label: "Country *" },
          { key: "address", label: "Address *" },           { key: "googleMapsUrl", label: "Google Maps URL" },
          { key: "bookingLink", label: "Booking Link (redirect URL after reservation)" },
          { key: "pricePerNight", label: "Price Per Night *" }, { key: "basePrice", label: "Base Price *" },
          { key: "rating", label: "Rating" },
          { key: "type", label: "Property Type *" },
          { key: "alt", label: "Image Alt Text *" },
        ].map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{field.label}</span>
            <input
              type={["pricePerNight", "basePrice", "rating"].includes(field.key) ? "number" : "text"}
              step={field.key === "rating" ? "0.1" : "any"}
              min={field.key === "rating" ? "0" : undefined}
              max={field.key === "rating" ? "5" : undefined}
              value={(form[field.key] ?? "") as string | number}
              onChange={(e) => update(field.key, ["pricePerNight", "basePrice", "rating"].includes(field.key) ? Number(e.target.value) : e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm"
              style={{ borderColor: "var(--border-soft)" }}
            />
          </label>
        ))}
        <ImageUploadButton label="Main Image *" value={(form.image ?? "") as string} onChange={(url) => update("image", url)} />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Experience Type *</span>
          <select value={form.experienceType as string} onChange={(e) => update("experienceType", e.target.value)} className="w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }}>
            <option>Folklore Homestays</option><option>Apartments & Condos</option><option>Villas</option>
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)", color: "var(--foreground)" }}>
          <input
            type="checkbox"
            checked={Boolean(form.isFeatured)}
            onChange={(e) => update("isFeatured", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-soft)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          Feature this stay on the homepage
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Description *</span>
          <textarea value={(form.description ?? "") as string} onChange={(e) => update("description", e.target.value)} className="min-h-24 w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
        </label>
        <MultiImageUploadButton values={Array.isArray(form.photos) ? form.photos as string[] : []} onChange={(urls) => update("photos", urls)} label="Photo Gallery" />
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Amenities (comma separated)</span>
          <input value={Array.isArray(form.amenities) ? (form.amenities as string[]).join(", ") : ""} onChange={(e) => update("amenities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} placeholder="WiFi, Parking, Kitchen" />
        </label>

        <div className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Amenities Detail</span>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {["parking", "heaterOnRequest", "tv", "fridge", "washingMachine", "powerBackup", "airConditioning", "geyser", "kitchen", "garden", "balcony", "lounge", "studyArea", "fireplace", "pool", "spa"].map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(((form.amenitiesDetail as Record<string, boolean>) || {})[key]) ?? false}
                  onChange={(e) => update("amenitiesDetail", { ...(form.amenitiesDetail as Record<string, boolean>), [key]: e.target.checked })}
                  className="rounded border-[var(--border-soft)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="truncate">{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="block sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Room Types *</span>
            <button type="button" onClick={() => update("roomTypes", [...(Array.isArray(form.roomTypes) ? form.roomTypes : []), { id: `room-${Date.now()}`, name: "", category: "", units: 1, bedConfiguration: "", bathroom: "", extraBedOption: "", pricePerNight: 0, maxOccupancy: 2 }])} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add Room
            </button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(form.roomTypes) ? form.roomTypes as Record<string, unknown>[] : []).map((room, idx) => (
              <div key={idx} className="rounded-lg border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.7)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Room {idx + 1}</span>
                  <button type="button" onClick={() => update("roomTypes", (form.roomTypes as Record<string, unknown>[]).filter((_, i) => i !== idx))} className="text-red-500 hover:opacity-70"><HiOutlineXMark className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "name", label: "Room Name *" }, { key: "category", label: "Category *" },
                    { key: "units", label: "Units *", type: "number" }, { key: "bedConfiguration", label: "Bed Configuration *" },
                    { key: "bathroom", label: "Bathroom *" }, { key: "extraBedOption", label: "Extra Bed Option" },
                    { key: "pricePerNight", label: "Price Per Night *", type: "number" }, { key: "maxOccupancy", label: "Max Occupancy *", type: "number" },
                  ].map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{field.label}</span>
                      <input value={(room[field.key] ?? "") as string | number} onChange={(e) => { const updated = [...(form.roomTypes as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }; update("roomTypes", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {!Array.isArray(form.roomTypes) || (form.roomTypes as Record<string, unknown>[]).length === 0 ? (
              <p className="text-center text-sm py-4" style={{ color: "var(--muted)" }}>No rooms added. Click &quot;Add Room&quot; to add room types.</p>
            ) : null}
          </div>
        </div>

        <div className="block sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Meal Options</span>
            <button type="button" onClick={() => update("mealOptions", [...(Array.isArray(form.mealOptions) ? form.mealOptions : []), { type: "breakfast", available: true, price: 0, description: "" }])} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add Meal
            </button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(form.mealOptions) ? form.mealOptions as Record<string, unknown>[] : []).map((meal, idx) => (
              <div key={idx} className="rounded-lg border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.7)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold capitalize" style={{ color: "var(--foreground)" }}>{(meal.type as string) || `Meal ${idx + 1}`}</span>
                  <button type="button" onClick={() => update("mealOptions", (form.mealOptions as Record<string, unknown>[]).filter((_, i) => i !== idx))} className="text-red-500 hover:opacity-70"><HiOutlineXMark className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Meal Type *</span>
                    <select value={(meal.type ?? "breakfast") as string} onChange={(e) => { const updated = [...(form.mealOptions as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], type: e.target.value }; update("mealOptions", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }}>
                      <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="packed">Packed</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Price (per person)</span>
                    <input type="number" value={(meal.price ?? 0) as number} onChange={(e) => { const updated = [...(form.mealOptions as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], price: Number(e.target.value) }; update("mealOptions", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Description</span>
                    <input value={(meal.description ?? "") as string} onChange={(e) => { const updated = [...(form.mealOptions as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], description: e.target.value }; update("mealOptions", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} />
                  </label>
                  <label className="flex items-center gap-2 pt-5">
                    <input type="checkbox" checked={(meal.available ?? true) as boolean} onChange={(e) => { const updated = [...(form.mealOptions as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], available: e.target.checked }; update("mealOptions", updated); }} className="rounded border-[var(--border-soft)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Available</span>
                  </label>
                </div>
              </div>
            ))}
            {!Array.isArray(form.mealOptions) || (form.mealOptions as Record<string, unknown>[]).length === 0 ? (
              <p className="text-center text-sm py-4" style={{ color: "var(--muted)" }}>No meal options added. Click &quot;Add Meal&quot; to add meal options.</p>
            ) : null}
          </div>
        </div>

        <div className="block sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Cancellation Policies</span>
            <button type="button" onClick={() => update("cancellationPolicies", [...(Array.isArray(form.cancellationPolicies) ? form.cancellationPolicies : []), { name: "", description: "", refundPercentage: 100, daysBeforeCheckin: 7 }])} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add Policy
            </button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(form.cancellationPolicies) ? form.cancellationPolicies as Record<string, unknown>[] : []).map((policy, idx) => (
              <div key={idx} className="rounded-lg border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.7)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{(policy.name as string) || `Policy ${idx + 1}`}</span>
                  <button type="button" onClick={() => update("cancellationPolicies", (form.cancellationPolicies as Record<string, unknown>[]).filter((_, i) => i !== idx))} className="text-red-500 hover:opacity-70"><HiOutlineXMark className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Policy Name *</span>
                    <input value={(policy.name ?? "") as string} onChange={(e) => { const updated = [...(form.cancellationPolicies as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], name: e.target.value }; update("cancellationPolicies", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} placeholder="e.g. Flexible" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Refund % *</span>
                    <input type="number" min={0} max={100} value={(policy.refundPercentage ?? 100) as number} onChange={(e) => { const updated = [...(form.cancellationPolicies as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], refundPercentage: Number(e.target.value) }; update("cancellationPolicies", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Days Before Check-in *</span>
                    <input type="number" min={0} value={(policy.daysBeforeCheckin ?? 7) as number} onChange={(e) => { const updated = [...(form.cancellationPolicies as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], daysBeforeCheckin: Number(e.target.value) }; update("cancellationPolicies", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Description *</span>
                    <input value={(policy.description ?? "") as string} onChange={(e) => { const updated = [...(form.cancellationPolicies as Record<string, unknown>[])]; updated[idx] = { ...updated[idx], description: e.target.value }; update("cancellationPolicies", updated); }} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-soft)" }} placeholder="e.g. Free cancellation until 7 days before check-in" />
                  </label>
                </div>
              </div>
            ))}
            {!Array.isArray(form.cancellationPolicies) || (form.cancellationPolicies as Record<string, unknown>[]).length === 0 ? (
              <p className="text-center text-sm py-4" style={{ color: "var(--muted)" }}>No cancellation policies added. Click &quot;Add Policy&quot; to add cancellation policies.</p>
            ) : null}
          </div>
        </div>

        <div className="block sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Pricing Configuration</span>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.7)" }}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Cleaning Fee Type</span>
                <select
                  value={((form.pricingConfig as Record<string, unknown>)?.cleaningFeeType as string) ?? "percentage"}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), cleaningFeeType: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Cleaning Fee Value</span>
                <input
                  type="number"
                  min="0"
                  value={((form.pricingConfig as Record<string, unknown>)?.cleaningFeeValue as number) ?? 15}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), cleaningFeeValue: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                  placeholder={((form.pricingConfig as Record<string, unknown>)?.cleaningFeeType as string) === "fixed" ? "₹ amount" : "% of nightly rate"}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Service Fee Type</span>
                <select
                  value={((form.pricingConfig as Record<string, unknown>)?.serviceFeeType as string) ?? "percentage"}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), serviceFeeType: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Service Fee Value</span>
                <input
                  type="number"
                  min="0"
                  value={((form.pricingConfig as Record<string, unknown>)?.serviceFeeValue as number) ?? 5}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), serviceFeeValue: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                  placeholder={((form.pricingConfig as Record<string, unknown>)?.serviceFeeType as string) === "fixed" ? "₹ amount" : "% of subtotal"}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>GST Percentage (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={((form.pricingConfig as Record<string, unknown>)?.gstPercentage as number) ?? 18}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), gstPercentage: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                  placeholder="18"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Extra Guest Fee (₹/night)</span>
                <input
                  type="number"
                  min="0"
                  value={((form.pricingConfig as Record<string, unknown>)?.extraGuestFee as number) ?? 0}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), extraGuestFee: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Extra Guest Threshold</span>
                <input
                  type="number"
                  min="1"
                  value={((form.pricingConfig as Record<string, unknown>)?.extraGuestThreshold as number) ?? 2}
                  onChange={(e) => update("pricingConfig", { ...((form.pricingConfig as Record<string, unknown>) ?? {}), extraGuestThreshold: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-soft)" }}
                  placeholder="2"
                />
                <p className="mt-1 text-[0.6rem]" style={{ color: "var(--muted)" }}>Guests above this number pay extra fee</p>
              </label>
            </div>
            <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: "rgba(74,101,68,0.05)", color: "var(--muted)" }}>
              <strong>Preview:</strong> For ₹{(form.pricePerNight as number) ?? 10000}/night × 2 nights = ₹{((form.pricePerNight as number) ?? 10000) * 2} subtotal
              {(() => {
                const cfg = (form.pricingConfig as Record<string, unknown>) ?? {};
                const nightly = (form.pricePerNight as number) ?? 10000;
                const subtotal = nightly * 2;
                const cleaning = cfg.cleaningFeeType === "fixed" ? (cfg.cleaningFeeValue as number) ?? 0 : Math.round(nightly * ((cfg.cleaningFeeValue as number) ?? 15) / 100);
                const service = cfg.serviceFeeType === "fixed" ? (cfg.serviceFeeValue as number) ?? 0 : Math.round(subtotal * ((cfg.serviceFeeValue as number) ?? 5) / 100);
                const gst = Math.round((subtotal + service) * ((cfg.gstPercentage as number) ?? 18) / 100);
                const total = subtotal + cleaning + service + gst;
                return ` → Cleaning: ₹${cleaning}, Service: ₹${service}, GST: ₹${gst} = Total: ₹${total.toLocaleString()}`;
              })()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving..." : initial ? "Update Stay" : "Create Stay"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border px-6 py-3 text-sm font-semibold" style={{ borderColor: "var(--border-soft)", color: "var(--muted)" }}>Cancel</button>
      </div>
    </form>
  );
}

function TestimonialsTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/content/testimonials").then((r) => r.json()).then((d) => { setItems(d.items ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/content/testimonials").then((r) => r.json()).then((d) => { setItems(d.items ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await api(`/api/admin/content/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  async function handleSave(data: Record<string, unknown>) {
    if (editing) {
      await api(`/api/admin/content/testimonials/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
    } else {
      await api("/api/admin/content/testimonials", { method: "POST", body: JSON.stringify(data) });
    }
    setEditing(null);
    setCreating(false);
    load();
  }

  if (creating || editing) {
    return <SimpleForm title={editing ? "Edit Testimonial" : "New Testimonial"} initial={editing} fields={[{ key: "name", label: "Name *" }, { key: "title", label: "Title" }, { key: "image", label: "Photo", image: true }, { key: "source", label: "Source" }, { key: "date", label: "Date" }, { key: "rating", label: "Rating", type: "number", step: "0.1" }, { key: "text", label: "Testimonial Text *", textarea: true }]} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null); }} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Testimonials</h1>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}><HiOutlinePlus className="h-4 w-4" /> Add Testimonial</button>
      </div>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id as string} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{item.name as string}</h3>
                <p className="truncate text-sm" style={{ color: "var(--muted)" }}>{item.text as string}</p>
                <p className="text-xs" style={{ color: "var(--cta)" }}>★ {item.rating as number} &middot; {(item.source as string) || "Guest"}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditing(item)} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlinePencil className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(item.id as string)} className="rounded-lg p-2 text-red-500 transition hover:opacity-70"><HiOutlineTrash className="h-5 w-5" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No testimonials. Add one or run the seed script.</p>}
        </div>
      )}
    </div>
  );
}

function ExperiencesTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/content/experiences").then((r) => r.json()).then((d) => { setItems(d.items ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/content/experiences").then((r) => r.json()).then((d) => { setItems(d.items ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await api(`/api/admin/content/experiences/${id}`, { method: "DELETE" });
    load();
  }

  async function handleSave(data: Record<string, unknown>) {
    if (editing) {
      await api(`/api/admin/content/experiences/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
    } else {
      await api("/api/admin/content/experiences", { method: "POST", body: JSON.stringify(data) });
    }
    setEditing(null);
    setCreating(false);
    load();
  }

  if (creating || editing) {
    return <SimpleForm title={editing ? "Edit Post" : "New Post"} initial={editing} fields={[{ key: "title", label: "Title *" }, { key: "image", label: "Cover Image", image: true }, { key: "category", label: "Category" }, { key: "author", label: "Author" }, { key: "date", label: "Date" }, { key: "readTime", label: "Read Time (min)", type: "number" }, { key: "featured", label: "Featured on homepage", checkbox: true }, { key: "description", label: "Description *", textarea: true }, { key: "content", label: "Full Blog Content", textarea: true }]} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null); }} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Blog Posts</h1>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}><HiOutlinePlus className="h-4 w-4" /> Add Post</button>
      </div>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id as string} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{item.title as string}</h3>
                <p className="truncate text-sm" style={{ color: "var(--muted)" }}>{item.description as string}</p>
                <p className="text-xs" style={{ color: "var(--cta)" }}>{item.category as string} &middot; {item.author as string} &middot; {item.date as string}</p>
                {(item.featured as boolean) && (
                  <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--primary)" }}>Featured</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditing(item)} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlinePencil className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(item.id as string)} className="rounded-lg p-2 text-red-500 transition hover:opacity-70"><HiOutlineTrash className="h-5 w-5" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No blog posts. Add one or run the seed script.</p>}
        </div>
      )}
    </div>
  );
}

function SimpleForm({ title, initial, fields, onSave, onCancel }: { title: string; initial: Record<string, unknown> | null; fields: { key: string; label: string; type?: string; step?: string; textarea?: boolean; image?: boolean; checkbox?: boolean }[]; onSave: (data: Record<string, unknown>) => void; onCancel: () => void }) {
  const defaultForm: Record<string, unknown> = { id: `item-${Date.now()}` };
  for (const f of fields) defaultForm[f.key] = f.checkbox ? false : f.type === "number" ? 0 : "";
  if (!initial) { defaultForm.date = new Date().toISOString().slice(0, 10); defaultForm.rating = 5; defaultForm.readTime = 5; defaultForm.featured = false; }
  const [form, setForm] = useState<Record<string, unknown>>(initial ?? defaultForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function update(key: string, value: unknown) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try { await onSave(form); } catch (err) { setSaveError(err instanceof Error ? err.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>{title}</h1>
      {saveError && <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{saveError}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          if (f.image) {
            return (
              <ImageUploadButton key={f.key} label={f.label} value={(form[f.key] ?? "") as string} onChange={(url) => update(f.key, url)} />
            );
          }
          return (
            <label key={f.key} className={f.textarea || f.checkbox ? "block sm:col-span-2" : "block"}>
              {f.checkbox ? (
                <div className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-[rgba(245,241,233,1)]" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)", color: "var(--foreground)" }}>
                  <input type="checkbox" checked={Boolean(form[f.key])} onChange={(e) => update(f.key, e.target.checked)} className="h-4 w-4 rounded border-[var(--border-soft)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                  <span>{f.label}</span>
                </div>
              ) : (
                <>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{f.label}</span>
                  {f.textarea ? (
                    <textarea value={(form[f.key] ?? "") as string} onChange={(e) => update(f.key, e.target.value)} className={f.key === "content" ? "min-h-64 w-full rounded-lg border px-4 py-3 text-sm" : "min-h-24 w-full rounded-lg border px-4 py-3 text-sm"} style={{ borderColor: "var(--border-soft)" }} />
                  ) : (
                    <input type={f.type ?? "text"} step={f.step ?? (f.type === "number" ? "any" : undefined)} value={(form[f.key] ?? "") as string | number} onChange={(e) => update(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className="w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
                  )}
                </>
              )}
            </label>
          );
        })}
      </div>
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving..." : initial ? "Update" : "Create"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border px-6 py-3 text-sm font-semibold" style={{ borderColor: "var(--border-soft)", color: "var(--muted)" }}>Cancel</button>
      </div>
    </form>
  );
}

function SubmissionsTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/submissions").then((r) => r.json()).then((d) => { setItems(d.submissions ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/submissions").then((r) => r.json()).then((d) => { setItems(d.submissions ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    await api("/api/admin/submissions", { method: "PUT", body: JSON.stringify({ id, action }) });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission?")) return;
    await api("/api/admin/submissions", { method: "DELETE", body: JSON.stringify({ id }) });
    load();
  }

  const statusColors: Record<string, string> = { pending: "#D82323", approved: "var(--primary)", rejected: "var(--muted)" };

  if (viewing) {
    const prop = (viewing.propertyPayload ?? viewing.property_payload ?? {}) as Record<string, unknown>;
    return (
      <div>
        <button onClick={() => setViewing(null)} className="mb-4 text-sm font-semibold" style={{ color: "var(--muted)" }}>&larr; Back to submissions</button>
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{(prop.title as string) || "Untitled Property"}</h2>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase" style={{ color: statusColors[viewing.status as string] ?? "var(--muted)", backgroundColor: "rgba(74,101,68,0.1)" }}>{viewing.status as string}</span>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <p className="text-sm"><strong>Submitted by:</strong> {viewing.userName as string || viewing.user_name as string} ({viewing.userEmail as string || viewing.user_email as string})</p>
            <p className="text-sm"><strong>Date:</strong> {new Date(viewing.submittedAt as string || viewing.submitted_at as string).toLocaleDateString()}</p>
            <p className="text-sm"><strong>City:</strong> {(prop.city as string) || "N/A"}</p>
            <p className="text-sm"><strong>State:</strong> {(prop.state as string) || "N/A"}</p>
            <p className="text-sm"><strong>Price:</strong> &#8377;{(prop.pricePerNight as number || prop.price_per_night as number) ?? "N/A"}/night</p>
            <p className="text-sm"><strong>Type:</strong> {(prop.experienceType as string || prop.experience_type as string) || (prop.type as string) || "N/A"}</p>
          </div>
          {(prop.description as string) && <p className="mb-4 text-sm" style={{ color: "var(--foreground-soft)" }}>{prop.description as string}</p>}
          {(viewing.adminNotes as string || viewing.admin_notes as string) && <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>Admin notes: {viewing.adminNotes as string || viewing.admin_notes as string}</p>}
          {viewing.status === "pending" && (
            <div className="flex gap-3">
              <button onClick={() => handleAction(viewing.id as string, "approve")} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}><HiOutlineCheck className="h-4 w-4" /> Approve</button>
              <button onClick={() => handleAction(viewing.id as string, "reject")} className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold text-red-600" style={{ borderColor: "red" }}><HiOutlineXMark className="h-4 w-4" /> Reject</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Property Submissions</h1>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : (
        <div className="space-y-3">
          {items.map((item) => {
            const prop = (item.propertyPayload ?? item.property_payload ?? {}) as Record<string, unknown>;
            return (
              <div key={item.id as string} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{(prop.title as string) || "Untitled"}</h3>
                    <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase" style={{ color: statusColors[item.status as string] ?? "var(--muted)", backgroundColor: "rgba(74,101,68,0.1)" }}>{item.status as string}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{item.userName as string || item.user_name as string} ({item.userEmail as string || item.user_email as string})</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setViewing(item)} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlineEye className="h-5 w-5" /></button>
                  {item.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(item.id as string, "approve")} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlineCheck className="h-5 w-5" /></button>
                      <button onClick={() => handleAction(item.id as string, "reject")} className="rounded-lg p-2 text-red-500 transition hover:opacity-70"><HiOutlineXMark className="h-5 w-5" /></button>
                    </>
                  )}
                  <button onClick={() => handleDelete(item.id as string)} className="rounded-lg p-2 text-red-500 transition hover:opacity-70"><HiOutlineTrash className="h-5 w-5" /></button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No property submissions yet.</p>}
        </div>
      )}
    </div>
  );
}

function ReservationsTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/bookings").then((r) => r.json()).then((d) => { setItems(d.bookings ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/bookings").then((r) => r.json()).then((d) => { setItems(d.bookings ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleStatusUpdate(id: string, status: string) {
    await api("/api/admin/bookings", { method: "PUT", body: JSON.stringify({ id, status }) });
    load();
    setViewing(null);
  }

  const statusColors: Record<string, string> = { pending: "#D82323", confirmed: "var(--primary)", cancelled: "var(--muted)", failed: "#6b7280" };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  if (viewing) {
    const guestDetails = viewing.guestDetails as Record<string, string> | undefined;
    return (
      <div>
        <button onClick={() => setViewing(null)} className="mb-4 text-sm font-semibold" style={{ color: "var(--muted)" }}>&larr; Back to reservations</button>
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{viewing.propertyName as string}</h2>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase" style={{ color: statusColors[viewing.status as string] ?? "var(--muted)", backgroundColor: "rgba(74,101,68,0.1)" }}>{viewing.status as string}</span>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <p className="text-sm"><strong>Booking ID:</strong> <span className="font-mono text-xs">{viewing.id as string}</span></p>
            <p className="text-sm"><strong>Amount:</strong> ₹{(viewing.amount as number)?.toLocaleString() ?? "N/A"}</p>
            <p className="text-sm"><strong>Check-in:</strong> {viewing.startDate as string}</p>
            <p className="text-sm"><strong>Check-out:</strong> {viewing.endDate as string}</p>
            <p className="text-sm"><strong>Guests:</strong> {viewing.guests as number}</p>
            <p className="text-sm"><strong>Room:</strong> {(viewing.roomId as string) || "Entire stay"}</p>
            <p className="text-sm"><strong>Booked on:</strong> {new Date(viewing.createdAt as string).toLocaleDateString()}</p>
            <p className="text-sm"><strong>Payment ID:</strong> <span className="font-mono text-xs">{(viewing.paymentId as string) || "N/A"}</span></p>
          </div>
          {guestDetails && (
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
              <h4 className="font-bold text-sm mb-2">Guest Details</h4>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <p><strong>Name:</strong> {guestDetails.firstName} {guestDetails.lastName}</p>
                <p><strong>Email:</strong> {guestDetails.email}</p>
                <p><strong>Phone:</strong> {guestDetails.phone}</p>
                {guestDetails.specialRequests && <p className="sm:col-span-2"><strong>Special Requests:</strong> {guestDetails.specialRequests}</p>}
              </div>
            </div>
          )}
          {viewing.status === "pending" && (
            <div className="flex gap-3">
              <button onClick={() => handleStatusUpdate(viewing.id as string, "confirmed")} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}><HiOutlineCheck className="h-4 w-4" /> Confirm</button>
              <button onClick={() => handleStatusUpdate(viewing.id as string, "cancelled")} className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold text-red-600" style={{ borderColor: "red" }}><HiOutlineXMark className="h-4 w-4" /> Cancel</button>
            </div>
          )}
          {viewing.status === "confirmed" && (
            <button onClick={() => handleStatusUpdate(viewing.id as string, "cancelled")} className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold text-red-600" style={{ borderColor: "red" }}><HiOutlineXMark className="h-4 w-4" /> Cancel Booking</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Bookings</h1>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition ${filter === s ? "text-white" : ""}`} style={{ backgroundColor: filter === s ? "var(--primary)" : "rgba(74,101,68,0.1)", color: filter === s ? "white" : "var(--primary)" }}>{s}</button>
          ))}
        </div>
      </div>
      <BookingSourcesPanel />
      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const guestDetails = item.guestDetails as Record<string, string> | undefined;
            return (
              <div key={item.id as string} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{item.propertyName as string}</h3>
                    <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase" style={{ color: statusColors[item.status as string] ?? "var(--muted)", backgroundColor: "rgba(74,101,68,0.1)" }}>{item.status as string}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{item.startDate as string} → {item.endDate as string} &middot; {item.guests as number} guest{(item.guests as number) > 1 ? "s" : ""}</p>
                  <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>{guestDetails ? `${guestDetails.firstName} ${guestDetails.lastName}` : "Guest"} &middot; {guestDetails?.email || "No email"}</p>
                  <p className="text-xs mt-1 font-bold" style={{ color: "var(--primary)" }}>₹{(item.amount as number)?.toLocaleString() ?? "N/A"}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setViewing(item)} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlineEye className="h-5 w-5" /></button>
                  {item.status === "pending" && (
                    <>
                      <button onClick={() => handleStatusUpdate(item.id as string, "confirmed")} className="rounded-lg p-2 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlineCheck className="h-5 w-5" /></button>
                      <button onClick={() => handleStatusUpdate(item.id as string, "cancelled")} className="rounded-lg p-2 text-red-500 transition hover:opacity-70"><HiOutlineXMark className="h-5 w-5" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && <p style={{ color: "var(--muted)" }}>No {filter === "all" ? "" : filter} bookings found.</p>}
        </div>
      )}
    </div>
  );
}

function MessagesTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact").then((r) => r.json()).then((d) => { setItems(d.submissions ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Contact Messages</h1>
      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id as string} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{item.name as string}</h3>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{new Date(item.created_at as string).toLocaleDateString()}</span>
              </div>
              <p className="text-sm" style={{ color: "var(--cta)" }}>{item.email as string} &middot; {(item.phone as string) || "No phone"}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--foreground-soft)" }}>{item.message as string}</p>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No messages yet.</p>}
        </div>
      )}
    </div>
  );
}

function HostsTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/hosts${filter !== "all" ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => { setItems(d.hosts ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    await api("/api/admin/hosts", {
      method: "PUT",
      body: JSON.stringify({ id, status }),
    });
    setItems((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)));
  }

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    approved: "var(--primary)",
    suspended: "#ef4444",
    rejected: "#6b7280",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Hosts</h1>
        <div className="flex gap-2">
          {["all", "pending", "approved", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition"
              style={{
                backgroundColor: filter === s ? "var(--primary)" : "rgba(74,101,68,0.1)",
                color: filter === s ? "white" : "var(--primary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((host) => (
            <div key={host.id as string} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: "var(--foreground)" }}>
                    {host.firstName as string} {host.lastName as string}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{host.email as string}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: "rgba(74,101,68,0.1)", color: statusColors[host.status as string] ?? "var(--muted)" }}
                >
                  {host.status as string}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3" style={{ color: "var(--foreground-soft)" }}>
                <div><strong>Phone:</strong> {(host.phone as string) || "N/A"}</div>
                <div><strong>Business:</strong> {(host.businessName as string) || "N/A"}</div>
                <div><strong>GST:</strong> {(host.gstNumber as string) || "N/A"}</div>
                <div><strong>Total Earnings:</strong> ₹{((host.totalEarnings as number) ?? 0).toLocaleString()}</div>
              </div>
              {host.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(host.id as string, "approved")}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <HiOutlineCheck className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(host.id as string, "rejected")}
                    className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold text-red-600"
                    style={{ borderColor: "#ef4444" }}
                  >
                    <HiOutlineXMark className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No hosts found.</p>}
        </div>
      )}
    </div>
  );
}

function CommissionsTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/commissions${filter !== "all" ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => { setItems(d.commissions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  async function markAsPaid(id: string) {
    const ref = prompt("Enter payout reference:");
    if (!ref) return;
    await api("/api/admin/commissions", {
      method: "PUT",
      body: JSON.stringify({ id, status: "paid", payoutReference: ref }),
    });
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: "paid", payoutReference: ref } : c)));
  }

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    processed: "#3b82f6",
    paid: "var(--primary)",
    cancelled: "#6b7280",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Commissions</h1>
        <div className="flex gap-2">
          {["all", "pending", "paid"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition"
              style={{
                backgroundColor: filter === s ? "var(--primary)" : "rgba(74,101,68,0.1)",
                color: filter === s ? "white" : "var(--primary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((commission) => (
            <div key={commission.id as string} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: "var(--foreground)" }}>
                    {commission.stayName as string}
                  </h3>
                  <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>{commission.bookingId as string}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: "rgba(74,101,68,0.1)", color: statusColors[commission.status as string] ?? "var(--muted)" }}
                >
                  {commission.status as string}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                <div><strong>Gross:</strong> ₹{((commission.grossAmount as number) / 100).toLocaleString()}</div>
                <div><strong>Commission ({commission.commissionPercentage as number}%):</strong> ₹{((commission.commissionAmount as number) / 100).toLocaleString()}</div>
                <div><strong>GST:</strong> ₹{((commission.gstOnCommission as number) / 100).toLocaleString()}</div>
                <div><strong>Net Payout:</strong> <span style={{ color: "var(--primary)", fontWeight: 700 }}>₹{((commission.netPayout as number) / 100).toLocaleString()}</span></div>
              </div>
              {commission.status === "pending" && (
                <button
                  onClick={() => markAsPaid(commission.id as string)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <HiOutlineCheck className="h-3.5 w-3.5" /> Mark as Paid
                </button>
              )}
              {(commission.payoutReference as string | null) && (
                <p className="text-xs" style={{ color: "var(--muted)" }}>Ref: {commission.payoutReference as string}</p>
              )}
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No commissions found.</p>}
        </div>
      )}
    </div>
  );
}

function PromoCodesTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minBookingAmount: 0,
    maxDiscountAmount: "",
    usageLimit: "",
    validFrom: "",
    validUntil: "",
  });

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/promo-codes")
      .then((r) => r.json())
      .then((d) => { setItems(d.promoCodes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function createPromoCode() {
    if (!form.code || !form.validFrom || !form.validUntil) {
      return;
    }
    const data = await api<{ promoCode: Record<string, unknown> }>("/api/admin/promo-codes", {
      method: "POST",
      body: JSON.stringify({
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minBookingAmount: form.minBookingAmount,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
      }),
    });
    setItems((prev) => [data.promoCode, ...prev]);
    setShowForm(false);
    setForm({ code: "", description: "", discountType: "percentage", discountValue: 10, minBookingAmount: 0, maxDiscountAmount: "", usageLimit: "", validFrom: "", validUntil: "" });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Promo Codes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <HiOutlinePlus className="h-3.5 w-3.5" /> Create
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border p-4 mb-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <h3 className="font-bold mb-4">New Promo Code</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Code *</span>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm uppercase"
                style={{ borderColor: "var(--border-soft)" }}
                placeholder="SUMMER20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Description</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-soft)" }}
                placeholder="20% off summer special"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Discount Type</span>
              <select
                value={form.discountType}
                onChange={(e) => setForm((prev) => ({ ...prev, discountType: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Discount Value *</span>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-soft)" }}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Valid From *</span>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm((prev) => ({ ...prev, validFrom: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-soft)" }}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Valid Until *</span>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border-soft)" }}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={createPromoCode}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Create Promo Code
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm font-bold"
              style={{ borderColor: "var(--border-soft)", color: "var(--muted)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((promo) => (
            <div key={promo.id as string} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold font-mono" style={{ color: "var(--primary)" }}>{promo.code as string}</h3>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{promo.description as string}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: promo.isActive ? "rgba(74,101,68,0.1)" : "rgba(239,68,68,0.1)", color: promo.isActive ? "var(--primary)" : "#ef4444" }}
                >
                  {promo.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div><strong>Discount:</strong> {promo.discountType === "percentage" ? `${promo.discountValue}%` : `₹${promo.discountValue}`}</div>
                <div><strong>Usage:</strong> {promo.usageCount as number}/{(promo.usageLimit as number | null) ?? "∞"}</div>
                <div><strong>Valid:</strong> {promo.validFrom as string} to {promo.validUntil as string}</div>
                <div><strong>Min Booking:</strong> ₹{(promo.minBookingAmount as number)?.toLocaleString() ?? 0}</div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No promo codes yet.</p>}
        </div>
      )}
    </div>
  );
}

function ReviewsTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/reviews?all=true")
      .then((r) => r.json())
      .then((d) => { setItems(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Reviews</h1>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((review) => (
            <div key={review.id as string} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill={star <= (review.rating as number) ? "#f59e0b" : "none"}
                      stroke="#f59e0b"
                      strokeWidth={2}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: review.isPublished ? "rgba(74,101,68,0.1)" : "rgba(239,68,68,0.1)", color: review.isPublished ? "var(--primary)" : "#ef4444" }}
                >
                  {review.isPublished ? "Published" : "Hidden"}
                </span>
              </div>
              {(review.title as string) && (
                <h3 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>{review.title as string}</h3>
              )}
              <p className="text-sm mb-2" style={{ color: "var(--foreground-soft)" }}>{review.comment as string}</p>
              <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                <span>Stay: {review.stayId as string}</span>
                <span>{new Date(review.createdAt as string).toLocaleDateString()}</span>
              </div>
              {(review.response as string | null) && (
                <div className="mt-3 rounded-lg p-3 text-sm" style={{ backgroundColor: "rgba(74,101,68,0.05)" }}>
                  <p className="font-bold mb-1" style={{ color: "var(--primary)" }}>Response:</p>
                  <p style={{ color: "var(--foreground-soft)" }}>{review.response as string}</p>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "var(--muted)" }}>No reviews yet.</p>}
        </div>
      )}
    </div>
  );
}
