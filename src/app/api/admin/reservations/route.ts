import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetAllReservations, dbUpdateReservationStatus } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const reservations = await dbGetAllReservations();
    return NextResponse.json({ reservations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load reservations." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; status?: string };

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status are required." }, { status: 400 });
  }

  try {
    await dbUpdateReservationStatus(body.id, body.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update reservation." },
      { status: 500 },
    );
  }
}
