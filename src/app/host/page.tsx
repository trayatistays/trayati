"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
  HiOutlineStar,
  HiOutlineUsers,
} from "react-icons/hi2";

type Tab = "overview" | "properties" | "bookings" | "earnings";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: HiOutlineHome },
  { id: "properties", label: "Properties", icon: HiOutlineBuildingOffice2 },
  { id: "bookings", label: "Bookings", icon: HiOutlineCalendarDays },
  { id: "earnings", label: "Earnings", icon: HiOutlineCurrencyDollar },
];

type Host = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
};

type Booking = {
  id: string;
  stayName: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number | null;
  guestDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
};

type Stay = {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  rating: number;
  totalBookings: number;
};

type Earnings = {
  totalEarnings: number;
  totalPayouts: number;
  pendingPayout: number;
  commissions: Array<{
    id: string;
    bookingId: string;
    stayName: string;
    grossAmount: number;
    commissionAmount: number;
    netPayout: number;
    status: string;
    createdAt: string;
  }>;
};

export default function HostPortalPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/host");
      return;
    }

    fetch("/api/host/stays")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          if (data.error.includes("not found")) {
            setError("You are not registered as a host. Contact admin to get approved.");
          } else if (data.error.includes("not approved")) {
            setError("Your host account is pending approval.");
          } else {
            setError(data.error);
          }
        } else {
          setHost(data.host);
        }
      })
      .catch(() => setError("Failed to load host data"))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="font-display text-2xl font-bold mb-2">Host Portal Access</h1>
          <p className="mb-6" style={{ color: "var(--muted)" }}>{error}</p>
          <Link
            href="/"
            className="inline-block rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <aside
        className={`shrink-0 border-r transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"}`}
        style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.98)" }}
      >
        <div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: "var(--border-soft)" }}>
          {sidebarOpen && (
            <span className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
              Host Portal
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 transition hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <HiOutlineChevronDown className={`h-4 w-4 transition ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
        <nav className="mt-2 space-y-1 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              style={{
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted)",
                backgroundColor: activeTab === tab.id ? "rgba(74,101,68,0.08)" : "transparent",
              }}
            >
              <tab.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Exit Portal</span>}
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {activeTab === "overview" && <OverviewTab host={host} />}
        {activeTab === "properties" && <PropertiesTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "earnings" && <EarningsTab />}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function OverviewTab({ host }: { host: Host | null }) {
  const [stats, setStats] = useState({ properties: 0, bookings: 0, totalEarnings: 0, pendingPayout: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/host/stays").then((r) => r.json()),
      fetch("/api/host/bookings").then((r) => r.json()),
      fetch("/api/host/earnings").then((r) => r.json()),
    ])
      .then(([staysData, bookingsData, earningsData]) => {
        setStats({
          properties: staysData.stays?.length ?? 0,
          bookings: bookingsData.bookings?.length ?? 0,
          totalEarnings: Math.round((earningsData.totalEarnings ?? 0) / 100),
          pendingPayout: Math.round((earningsData.pendingPayout ?? 0) / 100),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Welcome, {host?.firstName ?? "Host"}!
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Here&apos;s your hosting dashboard overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Properties" value={stats.properties} color="var(--primary)" />
        <StatCard label="Total Bookings" value={stats.bookings} color="var(--cta)" />
        <StatCard label="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} color="#10b981" />
        <StatCard label="Pending Payout" value={`₹${stats.pendingPayout.toLocaleString()}`} color="#f59e0b" />
      </div>

      <div className="mt-8 rounded-xl border p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
        <h2 className="font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--border-soft)" }}>
            <HiOutlineBuildingOffice2 className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--primary)" }} />
            <p className="text-sm font-semibold">Manage Properties</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Update listing details</p>
          </div>
          <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--border-soft)" }}>
            <HiOutlineCalendarDays className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--primary)" }} />
            <p className="text-sm font-semibold">View Bookings</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Check upcoming stays</p>
          </div>
          <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--border-soft)" }}>
            <HiOutlineCurrencyDollar className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--primary)" }} />
            <p className="text-sm font-semibold">Track Earnings</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>View payouts & reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertiesTab() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/host/stays")
      .then((r) => r.json())
      .then((data) => {
        setStays(data.stays ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Your Properties</h1>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : stays.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <HiOutlineBuildingOffice2 className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--muted)" }} />
          <p className="font-semibold mb-2">No properties assigned</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Contact admin to add properties to your account.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stays.map((stay) => (
            <div key={stay.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{stay.title}</h3>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{stay.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: "var(--primary)" }}>₹{stay.pricePerNight.toLocaleString()}/night</p>
                  <div className="flex items-center justify-end gap-1 text-sm">
                    <HiOutlineStar className="h-4 w-4" style={{ color: "#f59e0b" }} />
                    <span>{stay.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                <span>{stay.totalBookings} bookings</span>
                <Link href={`/property/${stay.id}`} className="font-semibold" style={{ color: "var(--primary)" }}>View Listing →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/host/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter);

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "var(--primary)",
    cancelled: "#6b7280",
    failed: "#ef4444",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Bookings</h1>
        <div className="flex gap-2">
          {["all", "confirmed", "pending", "cancelled"].map((s) => (
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
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: "var(--foreground)" }}>{booking.propertyName}</h3>
                  <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>{booking.id}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: "rgba(74,101,68,0.1)", color: statusColors[booking.status] ?? "var(--muted)" }}
                >
                  {booking.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div><span style={{ color: "var(--muted)" }}>Check-in:</span> {booking.startDate}</div>
                <div><span style={{ color: "var(--muted)" }}>Check-out:</span> {booking.endDate}</div>
                <div><span style={{ color: "var(--muted)" }}>Amount:</span> <strong style={{ color: "var(--primary)" }}>₹{((booking.amount ?? 0) / 100).toLocaleString()}</strong></div>
                <div><span style={{ color: "var(--muted)" }}>Booked:</span> {new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
              {booking.guestDetails && (
                <div className="text-xs pt-2 border-t" style={{ borderColor: "rgba(74,101,68,0.1)", color: "var(--foreground-soft)" }}>
                  <strong>Guest:</strong> {booking.guestDetails.firstName} {booking.guestDetails.lastName} ({booking.guestDetails.email})
                </div>
              )}
            </div>
          ))}
          {filteredBookings.length === 0 && <p style={{ color: "var(--muted)" }}>No bookings found.</p>}
        </div>
      )}
    </div>
  );
}

function EarningsTab() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/host/earnings")
      .then((r) => r.json())
      .then((data) => {
        setEarnings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Earnings</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total Earnings</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--primary)" }}>₹{Math.round((earnings?.totalEarnings ?? 0) / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total Paid Out</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "#10b981" }}>₹{Math.round((earnings?.totalPayouts ?? 0) / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Pending Payout</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "#f59e0b" }}>₹{Math.round((earnings?.pendingPayout ?? 0) / 100).toLocaleString()}</p>
        </div>
      </div>

      <h2 className="font-bold mb-4">Payout History</h2>
      <div className="space-y-3">
        {earnings?.commissions.map((commission) => (
          <div key={commission.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(245,241,233,0.9)" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{commission.stayName}</h3>
                <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>{commission.bookingId}</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{
                  backgroundColor: commission.status === "paid" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                  color: commission.status === "paid" ? "#10b981" : "#f59e0b",
                }}
              >
                {commission.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><span style={{ color: "var(--muted)" }}>Gross:</span> ₹{Math.round(commission.grossAmount / 100).toLocaleString()}</div>
              <div><span style={{ color: "var(--muted)" }}>Commission:</span> ₹{Math.round(commission.commissionAmount / 100).toLocaleString()}</div>
              <div><strong style={{ color: "var(--primary)" }}>Net: ₹{Math.round(commission.netPayout / 100).toLocaleString()}</strong></div>
            </div>
          </div>
        ))}
        {earnings?.commissions.length === 0 && <p style={{ color: "var(--muted)" }}>No payouts yet.</p>}
      </div>
    </div>
  );
}
