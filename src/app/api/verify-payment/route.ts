import { auth } from "@clerk/nextjs/server";
import { connection, NextResponse } from "next/server";
import { confirmBookingPayment, createLocalBlock, getBookingByOrderId, releaseBookingLockRecord } from "@/lib/booking/db";
import { invalidateAvailabilityCache } from "@/lib/booking/cache";
import { getRedisLock, releaseRedisLock } from "@/lib/booking/lock";
import { verifyCheckoutSignature } from "@/lib/booking/razorpay";
import { sendBookingConfirmationEmail, sendAdminBookingNotification } from "@/lib/email";
import { dbGetStayById } from "@/lib/db";
import { differenceInDays } from "@/lib/booking/date";
import { createInvoice } from "@/lib/invoice";
import { createCommission } from "@/lib/host";
import { incrementPromoCodeUsage } from "@/lib/promo-code";

export async function POST(request: Request) {
  await connection();
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };

  if (!body.orderId || !body.paymentId || !body.signature) {
    return NextResponse.json({ error: "orderId, paymentId, and signature are required." }, { status: 400 });
  }

  try {
    if (!verifyCheckoutSignature({
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
    })) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 401 });
    }

    const booking = await getBookingByOrderId(body.orderId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (booking.status !== "confirmed") {
      const confirmed = await confirmBookingPayment(booking.id, {
        paymentId: body.paymentId,
        orderId: body.orderId,
        payload: {
          source: "checkout_verification",
          paymentId: body.paymentId,
          orderId: body.orderId,
        },
      });

      await createLocalBlock({
        stayId: confirmed.stayId,
        roomId: confirmed.roomId,
        startDate: confirmed.startDate,
        endDate: confirmed.endDate,
        bookingId: confirmed.id,
        notes: "Confirmed via checkout signature verification",
      });

      if (confirmed.lockId) {
        const lock = await getRedisLock(confirmed.lockId);
        if (lock) {
          await releaseRedisLock(lock);
        }
        await releaseBookingLockRecord(confirmed.lockId, confirmed.id);
      }

      await invalidateAvailabilityCache(confirmed.stayId, confirmed.roomId);

      const stay = await dbGetStayById(confirmed.stayId);
      const nights = differenceInDays(confirmed.startDate, confirmed.endDate);
      const guestDetails = confirmed.guestDetails;

      if (confirmed.promoCodeId) {
        await incrementPromoCodeUsage(confirmed.promoCodeId).catch(() => {});
      }

      if (stay && confirmed.amount) {
        const selectedRoom = confirmed.roomId
          ? stay.roomTypes?.find((r) => r.id === confirmed.roomId)
          : null;
        const nightlyRate = selectedRoom?.pricePerNight ?? stay.pricePerNight;
        const subtotal = nightlyRate * nights;
        const cleaningFee = Math.round(nightlyRate * 0.15);
        const serviceFee = Math.round(subtotal * 0.05);
        const gstAmount = Math.round((subtotal + serviceFee) * 0.18);

        await createInvoice({
          booking: confirmed,
          stay,
          roomName: selectedRoom?.name,
          pricing: {
            baseAmount: subtotal,
            cleaningFee,
            serviceFee,
            gstAmount,
            discountAmount: confirmed.discountAmount ?? 0,
            totalAmount: Math.round(confirmed.amount / 100),
          },
          promoCode: undefined,
          paymentId: body.paymentId,
        }).catch((err) => {
          console.error("Failed to create invoice:", err);
        });

        const commissionPercentage = (stay as unknown as Record<string, unknown>).commissionPercentage as number ?? 10;
        await createCommission({
          booking: confirmed,
          stayId: confirmed.stayId,
          commissionPercentage,
        }).catch((err) => {
          console.error("Failed to create commission:", err);
        });
      }

      if (guestDetails && stay) {
        await Promise.all([
          sendBookingConfirmationEmail({
            bookingId: confirmed.id,
            guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
            guestEmail: guestDetails.email,
            propertyName: stay.title,
            checkIn: confirmed.startDate,
            checkOut: confirmed.endDate,
            guests: (confirmed.metadata?.guests as number) ?? 1,
            amount: (confirmed.amount ?? 0) / 100,
            nights,
          }),
          sendAdminBookingNotification({
            bookingId: confirmed.id,
            guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
            guestEmail: guestDetails.email,
            propertyName: stay.title,
            checkIn: confirmed.startDate,
            checkOut: confirmed.endDate,
            guests: (confirmed.metadata?.guests as number) ?? 1,
            amount: (confirmed.amount ?? 0) / 100,
            nights,
          }),
        ]).catch((err) => {
          console.error("Failed to send emails:", err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 500 },
    );
  }
}
