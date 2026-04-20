"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeaturedStay } from "@/data/featured-stays";
import type { BookingSource } from "@/lib/booking/types";

type SourceForm = {
  stayId: string;
  roomId: string;
  providerName: string;
  feedUrl: string;
  isActive: boolean;
};

const DEFAULT_FORM: SourceForm = {
  stayId: "",
  roomId: "",
  providerName: "",
  feedUrl: "",
  isActive: true,
};

export function BookingSourcesPanel() {
  const [stays, setStays] = useState<FeaturedStay[]>([]);
  const [sources, setSources] = useState<BookingSource[]>([]);
  const [form, setForm] = useState<SourceForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [staysResponse, sourcesResponse] = await Promise.all([
        fetch("/api/stays").then((response) => response.json()),
        fetch("/api/admin/booking-sources").then((response) => response.json()),
      ]);
      setStays(staysResponse.stays ?? []);
      setSources(sourcesResponse.sources ?? []);
    } catch {
      setMessage("Unable to load booking sources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedStay = useMemo(
    () => stays.find((stay) => stay.id === form.stayId) ?? null,
    [form.stayId, stays],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/booking-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayId: form.stayId,
          roomId: form.roomId || null,
          providerName: form.providerName,
          feedUrl: form.feedUrl,
          isActive: form.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save iCal source.");
      }

      setForm(DEFAULT_FORM);
      setMessage("iCal source saved.");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save iCal source.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this iCal source?")) {
      return;
    }

    const response = await fetch("/api/admin/booking-sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Unable to delete iCal source.");
      return;
    }

    await loadData();
  }

  async function handleSync(id: string) {
    setMessage("Syncing selected iCal feed...");
    const response = await fetch("/api/admin/booking-sources/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Sync failed.");
      return;
    }
    setMessage(data.success ? "Feed synced successfully." : data.error ?? "Sync completed with issues.");
    await loadData();
  }

  return (
    <section
      className="mb-6 rounded-2xl border p-5 sm:p-6"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: "rgba(245,241,233,0.92)",
      }}
    >
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold" style={{ color: "var(--foreground)" }}>
          iCal Sync Sources
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Add read-only OTA feeds here. Each feed syncs into blocked dates without overwriting local confirmed bookings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Property
          </span>
          <select
            value={form.stayId}
            onChange={(event) => setForm((current) => ({ ...current, stayId: event.target.value, roomId: "" }))}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border-soft)" }}
            required
          >
            <option value="">Select property</option>
            {stays.map((stay) => (
              <option key={stay.id} value={stay.id}>
                {stay.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Room Scope
          </span>
          <select
            value={form.roomId}
            onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <option value="">Entire stay</option>
            {selectedStay?.roomTypes.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Provider
          </span>
          <input
            value={form.providerName}
            onChange={(event) => setForm((current) => ({ ...current, providerName: event.target.value }))}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border-soft)" }}
            placeholder="Expedia, Stayflexi, Booking.com"
            required
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            iCal Feed URL
          </span>
          <input
            value={form.feedUrl}
            onChange={(event) => setForm((current) => ({ ...current, feedUrl: event.target.value }))}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border-soft)" }}
            placeholder="https://..."
            required
          />
        </label>

        <label className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium lg:col-span-2" style={{ borderColor: "var(--border-soft)" }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Keep this feed active for scheduled sync
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg px-4 py-3 text-sm font-bold text-white lg:col-span-2"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {submitting ? "Saving..." : "Add iCal Source"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm" style={{ color: "var(--foreground-soft)" }}>
          {message}
        </p>
      )}

      <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(74,101,68,0.04)" }}>
        <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
          Export to Airbnb/Booking.com
        </h3>
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          Add these URLs to your OTA channels to sync your Trayati bookings and block their calendars automatically.
        </p>
        <div className="mt-3 space-y-2">
          {stays.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--muted)" }}>No properties found.</p>
          ) : (
            stays.map((stay) => {
              const exportUrl = typeof window !== "undefined" ? `${window.location.origin}/api/ical-export/${stay.id}` : `/api/ical-export/${stay.id}`;
              return (
                <div key={stay.id} className="rounded-lg border p-3" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(255,255,255,0.6)" }}>
                  <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{stay.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-black/5 px-2 py-1 text-xs" style={{ color: "var(--foreground-soft)" }}>{exportUrl}</code>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(exportUrl); setMessage("URL copied!"); }}
                      className="rounded px-2 py-1 text-xs font-medium"
                      style={{ color: "var(--primary)", backgroundColor: "rgba(74,101,68,0.08)" }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
          Import from Airbnb/Booking.com
        </h3>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading sources...</p>
        ) : sources.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No iCal feeds added yet.</p>
        ) : (
          sources.map((source) => {
            const stay = stays.find((item) => item.id === source.stayId);
            const room = stay?.roomTypes.find((item) => item.id === source.roomId);
            return (
              <div
                key={source.id}
                className="rounded-xl border p-4"
                style={{
                  borderColor: "var(--border-soft)",
                  backgroundColor: "rgba(255,255,255,0.62)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold" style={{ color: "var(--foreground)" }}>
                      {source.providerName}
                    </p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {stay?.title ?? source.stayId}
                      {room ? ` • ${room.name}` : " • Entire stay"}
                    </p>
                    <p className="mt-1 break-all text-xs" style={{ color: "var(--foreground-soft)" }}>
                      {source.feedUrl}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSync(source.id)}
                      className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]"
                      style={{ color: "var(--primary)", backgroundColor: "rgba(74,101,68,0.08)" }}
                    >
                      Sync Now
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(source.id)}
                      className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-600"
                      style={{ backgroundColor: "rgba(220,38,38,0.08)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: "var(--muted)" }}>
                  <span>Status: {source.lastSyncStatus}</span>
                  <span>Active: {source.isActive ? "yes" : "no"}</span>
                  <span>Last sync: {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleString() : "Never"}</span>
                </div>
                {source.lastError && (
                  <p className="mt-2 text-xs text-red-600">{source.lastError}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
