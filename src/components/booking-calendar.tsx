"use client";

import { addDays, parseIsoDate, toIsoDate } from "@/lib/booking/date";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function monthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthIndex - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildCalendarDays(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, monthIndex - 1, 1));
  const offset = firstDay.getUTCDay();
  const start = new Date(firstDay);
  start.setUTCDate(start.getUTCDate() - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + index);
    return {
      date: toIsoDate(current),
      dayOfMonth: current.getUTCDate(),
      inMonth: current.getUTCMonth() === monthIndex - 1,
    };
  });
}

export function BookingCalendar({
  month,
  unavailableDates,
  selectedStartDate,
  selectedEndDate,
  onSelect,
  minimumDate,
}: {
  month: string;
  unavailableDates: Set<string>;
  selectedStartDate: string | null;
  selectedEndDate: string | null;
  onSelect: (date: string) => void;
  minimumDate: string;
}) {
  const days = buildCalendarDays(month);

  return (
    <div
      className="rounded-[1.4rem] border p-4"
      style={{
        borderColor: "rgba(74,101,68,0.14)",
        backgroundColor: "rgba(255,255,255,0.72)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: "var(--primary)" }}>
          {monthLabel(month)}
        </h4>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-2">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const disabled = !day.inMonth || day.date < minimumDate || unavailableDates.has(day.date);
          const isStart = selectedStartDate === day.date;
          const isEnd = selectedEndDate === day.date;
          const isInRange =
            Boolean(selectedStartDate) &&
            Boolean(selectedEndDate) &&
            selectedStartDate! < day.date &&
            day.date < selectedEndDate!;

          return (
            <button
              key={day.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day.date)}
              className="relative h-11 rounded-xl text-sm transition disabled:cursor-not-allowed"
              style={{
                color: disabled
                  ? "rgba(32,60,76,0.28)"
                  : isStart || isEnd
                    ? "#fff"
                    : "var(--foreground)",
                backgroundColor: isStart || isEnd
                  ? "var(--primary)"
                  : isInRange
                    ? "rgba(74,101,68,0.12)"
                    : "transparent",
                textDecoration: unavailableDates.has(day.date) ? "line-through" : "none",
                opacity: day.inMonth ? 1 : 0.35,
              }}
            >
              {day.dayOfMonth}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getNextMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return monthIndex === 12 ? `${year + 1}-01` : `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function getCurrentMonth() {
  const today = toIsoDate(new Date());
  return today.slice(0, 7);
}

export function rangeContainsUnavailable(startDate: string, endDate: string, unavailableDates: Set<string>) {
  for (let cursor = startDate; cursor < endDate; cursor = addDays(cursor, 1)) {
    if (unavailableDates.has(cursor)) {
      return true;
    }
  }
  return false;
}

export function nightsBetween(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = parseIsoDate(startDate).getTime();
  const end = parseIsoDate(endDate).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}
