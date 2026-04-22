"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineTicket,
} from "react-icons/hi2";
import type { Coupon, CouponStats } from "@/lib/db";

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ coupon }: { coupon: Coupon }) {
  const now = new Date();
  const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < now : false;
  const depleted = coupon.usedCount >= coupon.maxUses;
  if (!coupon.isActive) return <span className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(138,138,138,0.12)", color: "var(--muted)" }}>Inactive</span>;
  if (expired) return <span className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(216,35,35,0.10)", color: "#D82323" }}>Expired</span>;
  if (depleted) return <span className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(216,35,35,0.10)", color: "#D82323" }}>Depleted</span>;
  return <span className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(74,101,68,0.12)", color: "var(--primary)" }}>Active</span>;
}

const EMPTY_FORM = {
  code: "",
  discount: 10,
  maxUses: 1000,
  expiresAt: "",
  isActive: true,
};

export function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api<{ coupons: Coupon[]; stats: CouponStats }>("/api/admin/coupons")
      .then((d) => { setCoupons(d.coupons ?? []); setStats(d.stats ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setCreating(true);
    setError("");
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      discount: c.discount,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
    });
    setEditing(c);
    setCreating(false);
    setError("");
  }

  function cancelForm() { setCreating(false); setEditing(null); setError(""); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        discount: Number(form.discount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt || null,
      };
      if (editing) {
        await api(`/api/admin/coupons/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/admin/coupons", { method: "POST", body: JSON.stringify(payload) });
      }
      cancelForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/coupons/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleToggle(c: Coupon) {
    try {
      await api(`/api/admin/coupons/${c.id}`, { method: "PUT", body: JSON.stringify({ isActive: !c.isActive }) });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Toggle failed");
    }
  }

  function autoGenCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = "TRY" + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((f) => ({ ...f, code }));
  }

  const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="mt-1.5 text-2xl font-bold" style={{ color: "var(--primary)" }}>{value}</p>
      {sub && <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );

  if (creating || editing) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>{editing ? "Edit Coupon" : "Create Coupon"}</h1>
          <button onClick={cancelForm} className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Cancel</button>
        </div>
        <form onSubmit={handleSave} className="max-w-lg space-y-4">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Coupon Code *</span>
            <div className="flex gap-2">
              <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. WELCOME10" className="flex-1 rounded-lg border px-4 py-3 text-sm font-mono uppercase" style={{ borderColor: "var(--border-soft)" }} />
              <button type="button" onClick={autoGenCode} className="rounded-lg border px-3 py-3 text-xs font-bold transition hover:opacity-70" style={{ borderColor: "var(--border-soft)", color: "var(--cta)" }}>Auto</button>
            </div>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Discount % *</span>
              <input required type="number" min={1} max={100} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))} className="w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Max Uses *</span>
              <input required type="number" min={1} value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))} className="w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Expiry Date (optional)</span>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--border-soft)" }} />
          </label>
          <label className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)", color: "var(--foreground)" }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded" />
            Active (visible to assignment engine)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving…" : editing ? "Update Coupon" : "Create Coupon"}</button>
            <button type="button" onClick={cancelForm} className="rounded-lg border px-6 py-3 text-sm font-semibold" style={{ borderColor: "var(--border-soft)", color: "var(--muted)" }}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineTicket className="h-6 w-6" style={{ color: "var(--primary)" }} />
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Coupons</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
          <HiOutlinePlus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Coupons" value={stats.totalCoupons} />
          <StatCard label="Active" value={stats.activeCoupons} />
          <StatCard label="Total Assigned" value={stats.totalAssigned} sub="unique users" />
          <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} sub={`${stats.totalUsed} used`} />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border p-10 text-center" style={{ borderColor: "var(--border-soft)" }}>
          <div className="mb-3 text-4xl">🎟️</div>
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>No coupons yet</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Create your first coupon pool to start onboarding guests with offers.</p>
          <button onClick={openCreate} className="mt-4 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white mx-auto" style={{ backgroundColor: "var(--primary)" }}>
            <HiOutlinePlus className="h-4 w-4" /> Create First Coupon
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-soft)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.95)" }}>
                {["Code", "Discount", "Used / Max", "Status", "Expires", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} className="border-b transition hover:brightness-95" style={{ borderColor: "var(--border-soft)", backgroundColor: i % 2 === 0 ? "rgba(245,241,233,0.85)" : "rgba(239,231,220,0.7)" }}>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold tracking-wider" style={{ color: "var(--primary)" }}>{c.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--cta)" }}>{c.discount}%</td>
                  <td className="px-4 py-3">
                    <span style={{ color: c.usedCount >= c.maxUses ? "#D82323" : "var(--foreground)" }}>{c.usedCount}</span>
                    <span style={{ color: "var(--muted)" }}>/{c.maxUses}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge coupon={c} /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--foreground-soft)" }}>{formatDate(c.expiresAt)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} title="Edit" className="rounded-lg p-1.5 transition hover:opacity-70" style={{ color: "var(--primary)" }}><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleToggle(c)} title={c.isActive ? "Deactivate" : "Activate"} className="rounded-lg p-1.5 transition hover:opacity-70" style={{ color: c.isActive ? "#D82323" : "var(--primary)" }}>
                        {c.isActive ? <HiOutlineXMark className="h-4 w-4" /> : <HiOutlineCheck className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(c.id, c.code)} title="Delete" className="rounded-lg p-1.5 text-red-500 transition hover:opacity-70"><HiOutlineTrash className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
