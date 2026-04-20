import { NextResponse } from "next/server";
import { listAllConfirmedBookings } from "@/lib/booking/db";

function escapeIcalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatDateToIcal(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function generateIcal(
  bookings: Array<{
    id: string;
    startDate: string;
    endDate: string;
    stayId: string;
    roomId: string | null;
    metadata: Record<string, unknown>;
  }>,
  stayId: string,
): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trayati//Booking Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Trayati Bookings - ${stayId}`,
  ];

  for (const booking of bookings) {
    const startDate = formatDateToIcal(booking.startDate);
    const endDate = formatDateToIcal(booking.endDate);
    const guests = (booking.metadata?.guests as number) ?? 1;
    const summary = `Booking (${guests} guest${guests > 1 ? "s" : ""})`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${booking.id}@trayati.com`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`DTSTAMP:${timestamp}`);
    lines.push(`SUMMARY:${escapeIcalText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcalText(`Booking ID: ${booking.id}`)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stayId: string }> },
) {
  const { stayId } = await params;

  if (!stayId) {
    return NextResponse.json({ error: "Stay ID required" }, { status: 400 });
  }

  const bookings = await listAllConfirmedBookings(stayId);
  const icalContent = generateIcal(
    bookings.map((b) => ({
      id: b.id,
      startDate: b.startDate,
      endDate: b.endDate,
      stayId: b.stayId,
      roomId: b.roomId,
      metadata: b.metadata,
    })),
    stayId,
  );

  return new NextResponse(icalContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Disposition": `attachment; filename="trayati-${stayId}.ics"`,
    },
  });
}
