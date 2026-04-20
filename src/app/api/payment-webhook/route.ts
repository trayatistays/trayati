import { connection, NextResponse } from "next/server";
import { confirmBookingPayment, createLocalBlock, getBookingByOrderId, markBookingFailed, releaseBookingLockRecord } from "@/lib/booking/db";
import { invalidateAvailabilityCache } from "@/lib/booking/cache";
import { getRedisLock, releaseRedisLock } from "@/lib/booking/lock";
import { verifyWebhookSignature } from "@/lib/booking/razorpay";

async function releaseBookingLock(booking: NonNullable<Awaited<ReturnType<typeof getBookingByOrderId>>>) {
  if (!booking.lockId) {
    return;
  }

  const lock = await getRedisLock(booking.lockId);
  if (lock) {
    await releaseRedisLock(lock);
  }
  await releaseBookingLockRecord(booking.lockId, booking.id);
  await invalidateAvailabilityCache(booking.stayId, booking.roomId);
}

export async function POST(request: Request) {
  await connection();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const payload = await request.text();

  try {
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const event = JSON.parse(payload) as {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string; error_description?: string } };
        order?: { entity?: { id?: string } };
      };
    };

    const orderId = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const booking = await getBookingByOrderId(orderId);
    if (!booking) {
      return NextResponse.json({ ok: true });
    }

    if (event.event === "payment.captured" || event.event === "order.paid") {
      if (booking.status === "confirmed") {
        return NextResponse.json({ ok: true });
      }

      const confirmed = await confirmBookingPayment(booking.id, {
        paymentId: event.payload?.payment?.entity?.id ?? booking.paymentId ?? "",
        orderId,
        payload: event as unknown as Record<string, unknown>,
      });

      await createLocalBlock({
        stayId: confirmed.stayId,
        roomId: confirmed.roomId,
        startDate: confirmed.startDate,
        endDate: confirmed.endDate,
        bookingId: confirmed.id,
        notes: "Confirmed via Razorpay payment",
      });

      await releaseBookingLock(confirmed);
      await invalidateAvailabilityCache(confirmed.stayId, confirmed.roomId);

      return NextResponse.json({ ok: true });
    }

    if (event.event === "payment.failed") {
      const failed = await markBookingFailed(booking.id, event as unknown as Record<string, unknown>);
      await releaseBookingLock(failed);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 },
    );
  }
}
