import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { dbGetStayById } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookings = await Promise.all(
    (data ?? []).map(async (booking) => {
      const stay = await dbGetStayById(booking.stay_id);
      return {
        id: booking.id,
        userId: booking.user_id,
        stayId: booking.stay_id,
        roomId: booking.room_id,
        propertyName: stay?.title ?? booking.stay_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status,
        paymentId: booking.payment_id,
        paymentOrderId: booking.payment_order_id,
        amount: booking.amount,
        currency: booking.currency,
        guests: booking.metadata?.guests ?? 1,
        guestDetails: booking.guest_details,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
      };
    })
  );

  return NextResponse.json({ bookings });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "Booking ID and status required." }, { status: 400 });
  }

  const supabase = requireSupabaseAdmin();
  const { error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
