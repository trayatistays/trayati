import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyCheckoutSignature } from "@/lib/booking/razorpay";

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, paymentId, signature, bookingSessionId } = body;

    if (!orderId || !paymentId || !signature || !bookingSessionId) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const isValidSignature = verifyCheckoutSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch booking session
    const supabaseAdmin = requireSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("booking_sessions")
      .select("*")
      .eq("id", bookingSessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Booking session not found" },
        { status: 404 }
      );
    }

    // Verify user owns this booking session
    if (session.clerk_user_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create actual booking record
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        clerk_user_id: userId,
        stay_id: session.stay_id,
        room_id: session.room_id,
        start_date: session.check_in,
        end_date: session.check_out,
        guests: session.guests,
        total_amount: session.total_amount,
        status: "confirmed",
        payment_id: paymentId,
        razorpay_order_id: orderId,
        meal_option_id: session.meal_option_id,
        special_requests: session.special_requests,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Update booking session status
    await supabaseAdmin
      .from("booking_sessions")
      .update({ status: "completed" })
      .eq("id", bookingSessionId);

    return NextResponse.json(
      {
        bookingId: booking.id,
        status: "confirmed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
