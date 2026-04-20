import { connection, NextResponse, type NextRequest } from "next/server";
import { monthBounds } from "@/lib/booking/date";
import { getAvailability } from "@/lib/booking/availability";
import { availabilityQuerySchema } from "@/lib/booking/schemas";

export async function GET(request: NextRequest) {
  await connection();
  const parsed = availabilityQuerySchema.safeParse({
    stayId: request.nextUrl.searchParams.get("stayId"),
    roomId: request.nextUrl.searchParams.get("roomId"),
    month: request.nextUrl.searchParams.get("month") ?? undefined,
    startDate: request.nextUrl.searchParams.get("startDate") ?? undefined,
    endDate: request.nextUrl.searchParams.get("endDate") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { stayId, roomId, month, startDate, endDate } = parsed.data;
  const range = month ? monthBounds(month) : { startDate, endDate };

  if (!range.startDate || !range.endDate) {
    return NextResponse.json({ error: "Provide either month or startDate/endDate." }, { status: 400 });
  }

  try {
    const availability = await getAvailability({
      stayId,
      roomId,
      startDate: range.startDate,
      endDate: range.endDate,
    });

    return NextResponse.json(availability, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=180",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load calendar availability." },
      { status: 500 },
    );
  }
}
