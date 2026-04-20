import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { getStayById } from "@/lib/stays-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingSessionId: string }> }
) {
  try {
    const { bookingSessionId } = await params;

    const supabaseAdmin = requireSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Fetch booking session from database
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

    // Fetch stay details
    const stay = await getStayById(session.stay_id);
    if (!stay) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Find room and meal details
    const room = stay.roomTypes.find((r) => r.id === session.room_id);
    const meal = session.meal_option_id
      ? stay.mealOptions?.find((m) => m.id === session.meal_option_id)
      : null;

    const checkIn = new Date(session.check_in);
    const checkOut = new Date(session.check_out);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json(
      {
        booking: {
          id: session.id,
          stayId: session.stay_id,
          stayTitle: stay.title,
          roomName: room?.name || "Unknown Room",
          checkIn: session.check_in,
          checkOut: session.check_out,
          guests: session.guests,
          mealOption: meal?.name || null,
          nights: nights,
          roomTotal: session.room_total,
          mealTotal: session.meal_total,
          subtotal: session.subtotal,
          gstAmount: session.gst_amount,
          totalAmount: session.total_amount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching booking session:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch booking session",
      },
      { status: 500 }
    );
  }
}
