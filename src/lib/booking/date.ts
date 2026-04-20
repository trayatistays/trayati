import type { DateRange } from "@/lib/booking/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function toIsoDate(input: Date | string) {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const date = typeof input === "string" ? new Date(input) : input;
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addDays(value: string, days: number) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function differenceInDays(startDate: string, endDate: string) {
  const start = parseIsoDate(startDate).getTime();
  const end = parseIsoDate(endDate).getTime();
  return Math.round((end - start) / DAY_MS);
}

export function listDatesInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  for (
    let cursor = startDate;
    cursor < endDate;
    cursor = addDays(cursor, 1)
  ) {
    dates.push(cursor);
  }
  return dates;
}

export function rangesOverlap(first: DateRange, second: DateRange) {
  return first.startDate < second.endDate && second.startDate < first.endDate;
}

export function monthBounds(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = `${year}-${pad(monthIndex)}-01`;
  const nextMonth = monthIndex === 12 ? `${year + 1}-01-01` : `${year}-${pad(monthIndex + 1)}-01`;
  return { startDate: start, endDate: nextMonth };
}

export function normalizeRange(range: DateRange): DateRange {
  return {
    startDate: toIsoDate(range.startDate),
    endDate: toIsoDate(range.endDate),
  };
}
