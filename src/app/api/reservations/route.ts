import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbCreateReservation, dbGetStayById } from "@/lib/db";

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

  let userName = "";
  let userEmail = "";

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    userName = [
      clerkUser.firstName,
      clerkUser.lastName,
    ].filter(Boolean).join(" ") || clerkUser.username || "";
    const emailObj = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    );
    userEmail = emailObj?.emailAddress ?? "";
  } catch {
    userName = "";
    userEmail = "";
  }

  let stayTitle = "";
  let bookingLink = "";

  try {
    const stay = await dbGetStayById(body.stayId);
    if (stay) {
      stayTitle = stay.title;
      bookingLink = stay.bookingLink ?? "";
    }
  } catch {
    stayTitle = "";
    bookingLink = "";
  }

  try {
    const reservation = await dbCreateReservation({
      stayId: body.stayId,
      roomId: body.roomId ?? null,
      clerkUserId: userId,
      userName,
      userEmail,
      propertyName: stayTitle,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests ?? 1,
      status: "pending",
    });

    return NextResponse.json(
      { reservation, bookingLink: bookingLink || undefined },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create reservation." },
      { status: 500 },
    );
  }
}
