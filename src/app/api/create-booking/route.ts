import { auth } from "@clerk/nextjs/server";
import { connection, NextResponse } from "next/server";
import { createPendingBooking, getBookingByLockId } from "@/lib/booking/db";
import { getRedisLock } from "@/lib/booking/lock";
import { createBookingSchema } from "@/lib/booking/schemas";

export async function POST(request: Request) {
  await connection();
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Sign in to continue with booking." }, { status: 401 });
  }

  const parsed = createBookingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { stayId, roomId, startDate, endDate, guests, lockId, sessionId, guestDetails, promoCodeId, discountAmount } = parsed.data;

  try {
    const existing = await getBookingByLockId(lockId);
    if (existing) {
      return NextResponse.json({ error: "This lock is already attached to a booking." }, { status: 409 });
    }

    const lock = await getRedisLock(lockId);
    if (!lock) {
      return NextResponse.json({ error: "Your temporary hold has expired. Please reselect dates." }, { status: 409 });
    }

    if (
      lock.sessionId !== sessionId ||
      lock.stayId !== stayId ||
      (lock.roomId ?? null) !== (roomId ?? null) ||
      lock.startDate !== startDate ||
      lock.endDate !== endDate
    ) {
      return NextResponse.json({ error: "Lock details do not match the selected dates." }, { status: 409 });
    }

    const booking = await createPendingBooking({
      userId,
      stayId,
      roomId,
      startDate,
      endDate,
      guests,
      lockId,
      sessionId,
      guestDetails,
      promoCodeId,
      discountAmount,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 500 },
    );
  }
}
