import "server-only";

import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  BlockedDateRecord,
  BookingLock,
  BookingRecord,
  BookingSource,
} from "@/lib/booking/types";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result as T;
}

type RangeLookup = {
  stayId: string;
  roomId?: string | null;
  startDate: string;
  endDate: string;
};

function applyRoomScopeFilter<T extends { or: (value: string) => T; is: (column: string, value: null) => T }>(
  query: T,
  roomId?: string | null,
) {
  if (roomId) {
    return query.or(`room_id.is.null,room_id.eq.${roomId}`);
  }

  return query.is("room_id", null);
}

export async function listBookingSources(stayId?: string) {
  const supabase = requireSupabaseAdmin();
  let query = supabase.from("booking_sources").select("*").order("created_at", { ascending: false });

  if (stayId) {
    query = query.eq("stay_id", stayId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load booking sources: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<BookingSource>(row));
}

type BookingSourceUpsertInput = {
  id?: string;
  stayId: string;
  roomId?: string | null;
  providerName: string;
  feedUrl: string;
  isActive: boolean;
};

export async function upsertBookingSource(source: BookingSourceUpsertInput) {
  const supabase = requireSupabaseAdmin();
  const row = {
    id: source.id,
    stay_id: source.stayId,
    room_id: source.roomId ?? null,
    provider_name: source.providerName,
    feed_url: source.feedUrl,
    is_active: source.isActive,
  };

  const { data, error } = await supabase
    .from("booking_sources")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save booking source: ${error.message}`);
  }

  return toCamelCase<BookingSource>(data as Record<string, unknown>);
}

export async function deleteBookingSource(id: string) {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("booking_sources").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete booking source: ${error.message}`);
  }
}

export async function markBookingSourceSync(sourceId: string, status: "success" | "failed", lastError: string | null) {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("booking_sources").update({
    last_synced_at: new Date().toISOString(),
    last_sync_status: status,
    last_error: lastError,
  }).eq("id", sourceId);

  if (error) {
    throw new Error(`Failed to update booking source sync status: ${error.message}`);
  }
}

export async function listBlockedDatesForRange(input: RangeLookup) {
  const supabase = requireSupabaseAdmin();
  let query = supabase
    .from("blocked_dates")
    .select("*")
    .eq("stay_id", input.stayId)
    .eq("is_active", true)
    .lt("start_date", input.endDate)
    .gt("end_date", input.startDate);

  query = applyRoomScopeFilter(query, input.roomId);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load blocked dates: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<BlockedDateRecord>(row));
}

export async function replaceIcalBlocks(source: BookingSource, blocks: Array<{ startDate: string; endDate: string; externalUid: string | null; notes: string | null }>) {
  const supabase = requireSupabaseAdmin();

  const { error: deleteError } = await supabase
    .from("blocked_dates")
    .delete()
    .eq("source", "ical")
    .eq("booking_source_id", source.id);

  if (deleteError) {
    throw new Error(`Failed to clear previous iCal blocks: ${deleteError.message}`);
  }

  if (blocks.length === 0) {
    return;
  }

  const payload = blocks.map((block) => ({
    stay_id: source.stayId,
    room_id: source.roomId,
    start_date: block.startDate,
    end_date: block.endDate,
    source: "ical",
    booking_source_id: source.id,
    external_uid: block.externalUid,
    notes: block.notes,
  }));

  const { error: insertError } = await supabase.from("blocked_dates").insert(payload);
  if (insertError) {
    throw new Error(`Failed to store iCal blocks: ${insertError.message}`);
  }
}

export async function listConfirmedBookingsForRange(input: RangeLookup) {
  const supabase = requireSupabaseAdmin();
  let query = supabase
    .from("bookings")
    .select("*")
    .eq("stay_id", input.stayId)
    .eq("status", "confirmed")
    .lt("start_date", input.endDate)
    .gt("end_date", input.startDate);

  query = applyRoomScopeFilter(query, input.roomId);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<BookingRecord>(row));
}

export async function createBookingLockRecord(lock: BookingLock) {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("booking_locks").upsert({
    id: lock.id,
    stay_id: lock.stayId,
    room_id: lock.roomId,
    session_id: lock.sessionId,
    start_date: lock.startDate,
    end_date: lock.endDate,
    expires_at: lock.expiresAt,
    released_at: null,
  });

  if (error) {
    throw new Error(`Failed to store booking lock: ${error.message}`);
  }
}

export async function releaseBookingLockRecord(lockId: string, bookingId?: string | null) {
  const supabase = requireSupabaseAdmin();
  const update: Record<string, unknown> = {
    released_at: new Date().toISOString(),
  };

  if (bookingId) {
    update.booking_id = bookingId;
  }

  const { error } = await supabase.from("booking_locks").update(update).eq("id", lockId);
  if (error) {
    throw new Error(`Failed to release booking lock record: ${error.message}`);
  }
}

export async function createPendingBooking(input: {
  userId: string;
  stayId: string;
  roomId?: string | null;
  startDate: string;
  endDate: string;
  guests: number;
  lockId: string;
  sessionId: string;
  guestDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  promoCodeId?: string | null;
  discountAmount?: number;
}) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").insert({
    user_id: input.userId,
    stay_id: input.stayId,
    room_id: input.roomId ?? null,
    start_date: input.startDate,
    end_date: input.endDate,
    status: "pending",
    lock_id: input.lockId,
    guest_details: input.guestDetails ?? null,
    promo_code_id: input.promoCodeId ?? null,
    discount_amount: input.discountAmount ?? 0,
    metadata: {
      guests: input.guests,
      sessionId: input.sessionId,
    },
  }).select("*").single();

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return toCamelCase<BookingRecord>(data as Record<string, unknown>);
}

export async function getBookingById(id: string) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(`Failed to load booking: ${error.message}`);
  }

  return data ? toCamelCase<BookingRecord>(data as Record<string, unknown>) : null;
}

export async function getBookingByLockId(lockId: string) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").select("*").eq("lock_id", lockId).maybeSingle();
  if (error) {
    throw new Error(`Failed to load booking by lock id: ${error.message}`);
  }

  return data ? toCamelCase<BookingRecord>(data as Record<string, unknown>) : null;
}

export async function getBookingByOrderId(orderId: string) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").select("*").eq("payment_order_id", orderId).maybeSingle();
  if (error) {
    throw new Error(`Failed to load booking by order id: ${error.message}`);
  }

  return data ? toCamelCase<BookingRecord>(data as Record<string, unknown>) : null;
}

export async function attachOrderToBooking(bookingId: string, order: { orderId: string; amount: number; currency: string }) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").update({
    payment_order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
  }).eq("id", bookingId).select("*").single();

  if (error) {
    throw new Error(`Failed to attach order to booking: ${error.message}`);
  }

  return toCamelCase<BookingRecord>(data as Record<string, unknown>);
}

export async function confirmBookingPayment(bookingId: string, payment: { paymentId: string; orderId: string; payload: Record<string, unknown> }) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").update({
    status: "confirmed",
    payment_id: payment.paymentId,
    payment_order_id: payment.orderId,
    metadata: payment.payload,
  }).eq("id", bookingId).select("*").single();

  if (error) {
    throw new Error(`Failed to confirm booking: ${error.message}`);
  }

  return toCamelCase<BookingRecord>(data as Record<string, unknown>);
}

export async function markBookingFailed(bookingId: string, payload: Record<string, unknown>) {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").update({
    status: "failed",
    metadata: payload,
  }).eq("id", bookingId).select("*").single();

  if (error) {
    throw new Error(`Failed to mark booking as failed: ${error.message}`);
  }

  return toCamelCase<BookingRecord>(data as Record<string, unknown>);
}

export async function createLocalBlock(input: {
  stayId: string;
  roomId?: string | null;
  startDate: string;
  endDate: string;
  bookingId: string;
  notes?: string | null;
}) {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("blocked_dates").insert({
    stay_id: input.stayId,
    room_id: input.roomId ?? null,
    start_date: input.startDate,
    end_date: input.endDate,
    source: "local",
    booking_id: input.bookingId,
    notes: input.notes ?? null,
  });

  if (error) {
    throw new Error(`Failed to create local block: ${error.message}`);
  }
}

export async function listAllConfirmedBookings(stayId?: string) {
  const supabase = requireSupabaseAdmin();
  let query = supabase
    .from("bookings")
    .select("*")
    .eq("status", "confirmed")
    .order("start_date", { ascending: true });

  if (stayId) {
    query = query.eq("stay_id", stayId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<BookingRecord>(row));
}
