import { getAvailabilityCacheKey, getAvailabilityCacheTtlSeconds, getCachedAvailability, setCachedAvailability } from "@/lib/booking/cache";
import { checkRedisRangeConflict, listActiveRedisLocks } from "@/lib/booking/lock";
import { listBlockedDatesForRange, listConfirmedBookingsForRange } from "@/lib/booking/db";
import { listDatesInRange } from "@/lib/booking/date";
import type { AvailabilityResponse } from "@/lib/booking/types";

type Params = {
  stayId: string;
  roomId?: string | null;
  startDate: string;
  endDate: string;
  skipCache?: boolean;
  ignoreLockId?: string | null;
};

export async function getAvailability(params: Params): Promise<AvailabilityResponse> {
  const roomId = params.roomId ?? null;
  const cacheKey = getAvailabilityCacheKey({
    stayId: params.stayId,
    roomId,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (!params.skipCache && !params.ignoreLockId) {
    const cached = await getCachedAvailability(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const [blockedDates, confirmedBookings, activeLocks] = await Promise.all([
    listBlockedDatesForRange(params),
    listConfirmedBookingsForRange(params),
    listActiveRedisLocks(params),
  ]);

  const blockedRanges: AvailabilityResponse["blockedRanges"] = [];
  const unavailableDates = new Set<string>();

  for (const blocked of blockedDates) {
    blockedRanges.push({
      startDate: blocked.startDate,
      endDate: blocked.endDate,
      source: "blocked",
      reason: blocked.source === "ical" ? "Imported calendar block" : "Confirmed local block",
    });
    listDatesInRange(blocked.startDate, blocked.endDate).forEach((date) => unavailableDates.add(date));
  }

  for (const booking of confirmedBookings) {
    blockedRanges.push({
      startDate: booking.startDate,
      endDate: booking.endDate,
      source: "booking",
      reason: "Confirmed booking",
    });
    listDatesInRange(booking.startDate, booking.endDate).forEach((date) => unavailableDates.add(date));
  }

  for (const lock of activeLocks) {
    if (lock.id === params.ignoreLockId) {
      continue;
    }

    blockedRanges.push({
      startDate: lock.startDate,
      endDate: lock.endDate,
      source: "lock",
      reason: "Temporary hold",
    });
    listDatesInRange(lock.startDate, lock.endDate).forEach((date) => unavailableDates.add(date));
  }

  const response: AvailabilityResponse = {
    stayId: params.stayId,
    roomId,
    startDate: params.startDate,
    endDate: params.endDate,
    unavailableDates: Array.from(unavailableDates).sort(),
    blockedRanges: blockedRanges.sort((a, b) => a.startDate.localeCompare(b.startDate)),
    generatedAt: new Date().toISOString(),
    cacheTtlSeconds: getAvailabilityCacheTtlSeconds(),
  };

  if (!params.ignoreLockId) {
    await setCachedAvailability(cacheKey, response);
  }

  return response;
}

export async function isRangeAvailable(params: Params) {
  const [availability, hasRedisConflict] = await Promise.all([
    getAvailability({ ...params, skipCache: true }),
    checkRedisRangeConflict(params),
  ]);

  if (hasRedisConflict) {
    return { available: false, availability };
  }

  const requestedDates = listDatesInRange(params.startDate, params.endDate);
  const unavailable = requestedDates.some((date) => availability.unavailableDates.includes(date));
  return { available: !unavailable, availability };
}
