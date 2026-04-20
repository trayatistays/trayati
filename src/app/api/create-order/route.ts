import { auth } from "@clerk/nextjs/server";
import { connection, NextResponse } from "next/server";
import { differenceInDays } from "@/lib/booking/date";
import { isRangeAvailable } from "@/lib/booking/availability";
import { attachOrderToBooking, getBookingById } from "@/lib/booking/db";
import { getRedisLock } from "@/lib/booking/lock";
import { createOrderSchema } from "@/lib/booking/schemas";
import { getRazorpayClient, getRazorpayPublicConfig } from "@/lib/booking/razorpay";
import { dbGetStayById } from "@/lib/db";
import { calculatePricing } from "@/lib/pricing";

function getNightlyRate(stay: Awaited<ReturnType<typeof dbGetStayById>>, roomId: string | null) {
  if (!stay) {
    throw new Error("Stay not found.");
  }

  if (roomId) {
    const room = stay.roomTypes.find((item) => item.id === roomId);
    if (!room) {
      throw new Error("Selected room was not found.");
    }
    return room.pricePerNight;
  }

  return stay.pricePerNight;
}

export async function POST(request: Request) {
  await connection();
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Sign in to continue with payment." }, { status: 401 });
  }

  const parsed = createOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    const booking = await getBookingById(parsed.data.bookingId);
    if (!booking || booking.userId !== userId) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Only pending bookings can be paid." }, { status: 409 });
    }

    const lock = booking.lockId ? await getRedisLock(booking.lockId) : null;
    const bookingSessionId = typeof booking.metadata.sessionId === "string" ? booking.metadata.sessionId : null;
    if (!lock || bookingSessionId !== parsed.data.sessionId) {
      return NextResponse.json({ error: "Your temporary hold has expired. Please reselect dates." }, { status: 409 });
    }

    const revalidated = await isRangeAvailable({
      stayId: booking.stayId,
      roomId: booking.roomId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      ignoreLockId: booking.lockId,
    });

    if (!revalidated.available) {
      return NextResponse.json({ error: "These dates are no longer available." }, { status: 409 });
    }

    const stay = await dbGetStayById(booking.stayId);
    const nightlyRate = getNightlyRate(stay, booking.roomId);
    const nights = differenceInDays(booking.startDate, booking.endDate);
    const guests = (booking.metadata?.guests as number) ?? 1;
    
    const pricing = calculatePricing(nightlyRate, nights, guests, stay?.pricingConfig);
    const amountInRupees = parsed.data.amount ?? pricing.total;
    const amountInSubunits = amountInRupees * 100;

    const order = await getRazorpayClient().orders.create({
      amount: amountInSubunits,
      currency: "INR",
      receipt: `booking_${booking.id.slice(0, 12)}`,
      notes: {
        bookingId: booking.id,
        stayId: booking.stayId,
      },
    });

    await attachOrderToBooking(booking.id, {
      orderId: order.id,
      amount: amountInSubunits,
      currency: order.currency,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
      stayTitle: stay?.title ?? "Trayati Stay",
      ...getRazorpayPublicConfig(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create payment order." },
      { status: 500 },
    );
  }
}
