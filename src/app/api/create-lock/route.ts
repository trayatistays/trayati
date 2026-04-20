import crypto from "node:crypto";
import { connection, NextResponse } from "next/server";
import { createRedisLock } from "@/lib/booking/lock";
import { isRangeAvailable } from "@/lib/booking/availability";
import { createBookingLockRecord } from "@/lib/booking/db";
import { invalidateAvailabilityCache } from "@/lib/booking/cache";
import { createLockSchema } from "@/lib/booking/schemas";

export async function POST(request: Request) {
  await connection();
  const parsed = createLockSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { sessionId, stayId, roomId, startDate, endDate } = parsed.data;
  const normalizedRoomId = roomId ?? null;

  try {
    const availability = await isRangeAvailable({ stayId, roomId: normalizedRoomId, startDate, endDate });
    if (!availability.available) {
      return NextResponse.json(
        { error: "Selected dates are no longer available.", availability: availability.availability },
        { status: 409 },
      );
    }

      const lock = await createRedisLock({
      id: crypto.randomUUID(),
      sessionId,
      stayId,
      roomId: normalizedRoomId,
      startDate,
      endDate,
    });

    if (!lock) {
      return NextResponse.json({ error: "Unable to place a temporary hold." }, { status: 409 });
    }

    await createBookingLockRecord(lock);
    await invalidateAvailabilityCache(stayId, normalizedRoomId);

    return NextResponse.json({ lock }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create lock." },
      { status: 500 },
    );
  }
}
