import "server-only";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { BookingRecord } from "@/lib/booking/types";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result as T;
}

export async function getHostBookings(hostId: string): Promise<Array<BookingRecord & { stayName: string; propertyName: string }>> {
  const supabase = requireSupabaseAdmin();
  
  const { data: stayHosts } = await supabase
    .from("stay_hosts")
    .select("stay_id")
    .eq("host_id", hostId);

  if (!stayHosts || stayHosts.length === 0) {
    return [];
  }

  const stayIds = stayHosts.map((sh) => sh.stay_id);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, stays(title)")
    .in("stay_id", stayIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch host bookings: ${error.message}`);
  }

  return ((bookings ?? []) as Record<string, unknown>[]).map((b) => ({
    ...toCamelCase<BookingRecord>(b),
    stayName: (b.stays as Record<string, unknown>)?.title as string ?? "",
    propertyName: (b.stays as Record<string, unknown>)?.title as string ?? "",
  }));
}

export async function getHostEarnings(hostId: string): Promise<{
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
}> {
  const supabase = requireSupabaseAdmin();
  
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, stays(title)")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  const commissionList = ((commissions ?? []) as Record<string, unknown>[]).map((c) => ({
    id: c.id as string,
    bookingId: c.booking_id as string,
    stayName: ((c.stays as Record<string, unknown>)?.title as string) ?? "Unknown",
    grossAmount: c.gross_amount as number,
    commissionAmount: c.commission_amount as number,
    netPayout: c.net_payout as number,
    status: c.status as string,
    createdAt: c.created_at as string,
  }));

  const totalEarnings = commissionList.reduce((sum, c) => sum + c.grossAmount, 0);
  const totalPayouts = commissionList
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.netPayout, 0);
  const pendingPayout = commissionList
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.netPayout, 0);

  return {
    totalEarnings,
    totalPayouts,
    pendingPayout,
    commissions: commissionList,
  };
}

export async function getHostStays(hostId: string): Promise<Array<{
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  rating: number;
  totalBookings: number;
}>> {
  const supabase = requireSupabaseAdmin();
  
  const { data: stayHosts } = await supabase
    .from("stay_hosts")
    .select("stay_id, stays(id, title, location, price_per_night, rating)")
    .eq("host_id", hostId);

  if (!stayHosts || stayHosts.length === 0) {
    return [];
  }

  const stayIds = stayHosts.map((sh) => sh.stay_id);
  
  const { data: bookings } = await supabase
    .from("bookings")
    .select("stay_id")
    .eq("status", "confirmed")
    .in("stay_id", stayIds);

  const bookingCounts: Record<string, number> = {};
  (bookings ?? []).forEach((b) => {
    const stayId = b.stay_id as string;
    bookingCounts[stayId] = (bookingCounts[stayId] ?? 0) + 1;
  });

  return stayHosts.map((sh) => {
    const stay = sh.stays as unknown as Record<string, unknown>;
    return {
      id: stay?.id as string,
      title: stay?.title as string,
      location: stay?.location as string,
      pricePerNight: stay?.price_per_night as number,
      rating: stay?.rating as number,
      totalBookings: bookingCounts[stay?.id as string] ?? 0,
    };
  });
}
