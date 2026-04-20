import { toIsoDate, addDays } from "@/lib/booking/date";
import { listBookingSources, markBookingSourceSync, replaceIcalBlocks } from "@/lib/booking/db";
import { invalidateAvailabilityCache } from "@/lib/booking/cache";
import type { BookingSource } from "@/lib/booking/types";

function normalizeEventRange(event: Record<string, unknown>) {
  const startValue = event.start;
  const endValue = event.end;
  if (!(startValue instanceof Date)) {
    return null;
  }

  const startDate = toIsoDate(startValue);
  const computedEnd = endValue instanceof Date ? toIsoDate(endValue) : addDays(startDate, 1);
  const endDate = computedEnd <= startDate ? addDays(startDate, 1) : computedEnd;

  return {
    startDate,
    endDate,
    externalUid: typeof event.uid === "string" ? event.uid : null,
    notes: typeof event.summary === "string" ? event.summary : null,
  };
}

export async function syncBookingSource(source: BookingSource) {
  try {
    const ical = await import("node-ical");
    const parsed = await ical.async.fromURL(source.feedUrl);
    const blocks = Object.values(parsed)
      .filter((entry) => entry && typeof entry === "object" && "type" in entry && entry.type === "VEVENT")
      .map((event) => normalizeEventRange(event as Record<string, unknown>))
      .filter((event): event is NonNullable<typeof event> => Boolean(event));

    await replaceIcalBlocks(source, blocks);
    await markBookingSourceSync(source.id, "success", null);
    await invalidateAvailabilityCache(source.stayId, source.roomId);

    return {
      sourceId: source.id,
      importedCount: blocks.length,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "iCal sync failed";
    await markBookingSourceSync(source.id, "failed", message);
    return {
      sourceId: source.id,
      importedCount: 0,
      success: false,
      error: message,
    };
  }
}

export async function syncAllBookingSources() {
  const sources = (await listBookingSources()).filter((source) => source.isActive);
  const results = [];

  for (const source of sources) {
    results.push(await syncBookingSource(source));
  }

  return results;
}
