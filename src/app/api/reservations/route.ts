import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbCreateReservation } from "@/lib/db";

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Sign in to reserve this stay." }, { status: 401 });
  }

  const body = (await request.json()) as {
    stayId?: string;
    roomId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };

  if (!body.stayId || !body.checkIn || !body.checkOut) {
    return NextResponse.json(
      { error: "stayId, checkIn, and checkOut are required." },
      { status: 400 },
    );
  }

  try {
    const reservation = await dbCreateReservation({
      stayId: body.stayId,
      roomId: body.roomId ?? null,
      clerkUserId: userId,
      userName: "",
      userEmail: "",
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests ?? 1,
      status: "pending",
    });
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create reservation." },
      { status: 500 },
    );
  }
}
