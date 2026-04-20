import { multiLevelDel, multiLevelGet, multiLevelSet } from "@/lib/cache";
import type { AvailabilityResponse } from "@/lib/booking/types";

const DEFAULT_TTL_SECONDS = 180;

export function getAvailabilityCacheKey(params: {
  stayId: string;
  roomId: string | null;
  startDate: string;
  endDate: string;
}) {
  return `availability:${params.stayId}:${params.roomId ?? "__stay__"}:${params.startDate}:${params.endDate}`;
}

export async function getCachedAvailability(key: string) {
  return multiLevelGet<AvailabilityResponse>(key);
}

export async function setCachedAvailability(key: string, value: AvailabilityResponse) {
  await multiLevelSet(key, value, DEFAULT_TTL_SECONDS);
}

export async function invalidateAvailabilityCache(stayId: string, roomId?: string | null) {
  await multiLevelDel(`availability:${stayId}:${roomId ?? ""}`);
  await multiLevelDel(`availability:${stayId}:__stay__`);
}

export function getAvailabilityCacheTtlSeconds() {
  return DEFAULT_TTL_SECONDS;
}
