import "server-only";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { Host, Commission, StayHost } from "@/lib/types";
import type { BookingRecord } from "@/lib/booking/types";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result as T;
}

export async function createHost(input: {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  gstNumber?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
}): Promise<Host> {
  const supabase = requireSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("hosts")
    .insert({
      clerk_user_id: input.clerkUserId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      business_name: input.businessName ?? null,
      gst_number: input.gstNumber ?? null,
      pan_number: input.panNumber ?? null,
      bank_account_number: input.bankAccountNumber ?? null,
      bank_ifsc: input.bankIfsc ?? null,
      bank_name: input.bankName ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create host: ${error.message}`);
  }

  return toCamelCase<Host>(data as Record<string, unknown>);
}

export async function getHostByClerkUserId(clerkUserId: string): Promise<Host | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("hosts")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get host: ${error.message}`);
  }

  return data ? toCamelCase<Host>(data as Record<string, unknown>) : null;
}

export async function getHostById(id: string): Promise<Host | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("hosts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get host: ${error.message}`);
  }

  return data ? toCamelCase<Host>(data as Record<string, unknown>) : null;
}

export async function listHosts(status?: string): Promise<Host[]> {
  const supabase = requireSupabaseAdmin();
  let query = supabase.from("hosts").select("*").order("created_at", { ascending: false });
  
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list hosts: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<Host>(row));
}

export async function updateHostStatus(id: string, status: Host["status"], notes?: string): Promise<Host> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("hosts")
    .update({ status, notes: notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update host: ${error.message}`);
  }

  return toCamelCase<Host>(data as Record<string, unknown>);
}

export async function createCommission(input: {
  booking: BookingRecord;
  stayId: string;
  hostId?: string;
  commissionPercentage: number;
}): Promise<Commission> {
  const supabase = requireSupabaseAdmin();
  
  const grossAmount = input.booking.amount ?? 0;
  const commissionAmount = Math.round((grossAmount * input.commissionPercentage) / 100);
  const gstOnCommission = Math.round(commissionAmount * 0.18);
  const tds = Math.round(commissionAmount * 0.01);
  const netPayout = grossAmount - commissionAmount - gstOnCommission - tds;

  const { data, error } = await supabase
    .from("commissions")
    .insert({
      booking_id: input.booking.id,
      stay_id: input.stayId,
      host_id: input.hostId ?? null,
      gross_amount: grossAmount,
      commission_percentage: input.commissionPercentage,
      commission_amount: commissionAmount,
      gst_on_commission: gstOnCommission,
      tds: tds,
      net_payout: netPayout,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create commission: ${error.message}`);
  }

  return toCamelCase<Commission>(data as Record<string, unknown>);
}

export async function listCommissions(status?: string): Promise<Commission[]> {
  const supabase = requireSupabaseAdmin();
  let query = supabase.from("commissions").select("*").order("created_at", { ascending: false });
  
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list commissions: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<Commission>(row));
}

export async function updateCommissionStatus(
  id: string,
  status: Commission["status"],
  payoutReference?: string,
): Promise<Commission> {
  const supabase = requireSupabaseAdmin();
  
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  
  if (status === "paid" && payoutReference) {
    updateData.payout_reference = payoutReference;
    updateData.processed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("commissions")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update commission: ${error.message}`);
  }

  return toCamelCase<Commission>(data as Record<string, unknown>);
}

export async function assignStayToHost(stayId: string, hostId: string, ownershipPercentage: number = 100): Promise<StayHost> {
  const supabase = requireSupabaseAdmin();
  
  const { data: existing } = await supabase
    .from("stay_hosts")
    .select("*")
    .eq("stay_id", stayId)
    .eq("is_primary", true)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("stay_hosts")
      .update({ host_id: hostId, ownership_percentage: ownershipPercentage })
      .eq("id", (existing as Record<string, unknown>).id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update stay host: ${error.message}`);
    }

    return toCamelCase<StayHost>(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("stay_hosts")
    .insert({
      stay_id: stayId,
      host_id: hostId,
      ownership_percentage: ownershipPercentage,
      is_primary: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to assign stay to host: ${error.message}`);
  }

  await supabase
    .from("stays")
    .update({ host_id: hostId, commission_percentage: 10 })
    .eq("id", stayId);

  return toCamelCase<StayHost>(data as Record<string, unknown>);
}

export async function getHostByStayId(stayId: string): Promise<Host | null> {
  const supabase = requireSupabaseAdmin();
  
  const { data: stayHost } = await supabase
    .from("stay_hosts")
    .select("host_id")
    .eq("stay_id", stayId)
    .eq("is_primary", true)
    .maybeSingle();

  if (!stayHost) {
    return null;
  }

  return getHostById((stayHost as Record<string, unknown>).host_id as string);
}

export async function getStaysByHostId(hostId: string): Promise<string[]> {
  const supabase = requireSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("stay_hosts")
    .select("stay_id")
    .eq("host_id", hostId);

  if (error) {
    throw new Error(`Failed to get host stays: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => row.stay_id as string);
}
