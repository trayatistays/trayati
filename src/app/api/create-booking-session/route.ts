import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { getStayById } from "@/lib/stays-api";

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
    const {
      stayId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      mealOption,
      specialRequests,
    } = body;

    // Validate required fields
    if (!stayId || !roomId || !checkInDate || !checkOutDate || !guests) {
      return NextResponse.json(
        { error: "Missing required booking details" },
        { status: 400 }
      );
    }

    // Get stay details
    const stay = await getStayById(stayId);
    if (!stay) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get selected room
    const selectedRoom = stay.roomTypes.find((r) => r.id === roomId);
    if (!selectedRoom) {
      return NextResponse.json(
        { error: "Selected room not available" },
        { status: 404 }
      );
    }

    // Get selected meal option
    let selectedMeal = null;
    if (mealOption && stay.mealOptions) {
      selectedMeal = stay.mealOptions.find((m) => m.id === mealOption);
    }

    // Calculate price
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < 1) {
      return NextResponse.json(
        { error: "Invalid dates selected" },
        { status: 400 }
      );
    }

    const roomTotal = selectedRoom.pricePerNight * nights;
    const mealPrice = selectedMeal
      ? (selectedMeal.pricePerPerson || selectedMeal.price || 0)
      : 0;
    const mealTotal = mealPrice * guests * nights;
    const subtotal = roomTotal + mealTotal;
    const gst = subtotal * 0.18;
    const totalAmount = subtotal + gst;

    // Create booking session in database
    const supabaseAdmin = requireSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("booking_sessions")
      .insert({
        clerk_user_id: userId,
        stay_id: stayId,
        room_id: roomId,
        check_in: checkInDate,
        check_out: checkOutDate,
        guests: guests,
        meal_option_id: mealOption || null,
        special_requests: specialRequests || "",
        room_total: roomTotal,
        meal_total: mealTotal,
        subtotal: subtotal,
        gst_amount: gst,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating booking session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create booking session" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        bookingSessionId: session.id,
        totalAmount: totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking session error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create booking session",
      },
      { status: 500 }
    );
  }
}
