import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { getStayById } from "@/lib/stays-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    const supabaseAdmin = requireSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Fetch booking from database
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Fetch stay and room details for display
    const stay = await getStayById(booking.stay_id);
    if (!stay) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const room = stay.roomTypes.find((r) => r.id === booking.room_id);

    return NextResponse.json(
      {
        booking: {
          id: booking.id,
          stayTitle: stay.title,
          roomName: room?.name || "Standard Room",
          checkIn: booking.start_date,
          checkOut: booking.end_date,
          guests: booking.guests,
          totalAmount: booking.total_amount,
          invoiceNumber: booking.invoice_id || booking.id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch booking",
      },
      { status: 500 }
    );
  }
}
