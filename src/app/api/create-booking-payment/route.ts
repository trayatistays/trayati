import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { getRazorpayClient } from "@/lib/booking/razorpay";

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Please sign in to continue" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingSessionId, totalAmount } = body;

    if (!bookingSessionId || !totalAmount) {
      return NextResponse.json(
        { error: "Missing booking session or amount" },
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

    // Create Razorpay order
    const amountInSubunits = Math.round(totalAmount * 100);
    const order = await getRazorpayClient().orders.create({
      amount: amountInSubunits,
      currency: "INR",
      receipt: `booking_session_${bookingSessionId.slice(0, 12)}`,
      notes: {
        bookingSessionId: bookingSessionId,
        stayId: session.stay_id,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}
