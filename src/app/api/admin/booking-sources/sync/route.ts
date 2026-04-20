import { connection, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listBookingSources } from "@/lib/booking/db";
import { syncBookingSource } from "@/lib/booking/ical";

export async function POST(request: Request) {
  await connection();
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Source id is required." }, { status: 400 });
  }

  try {
    const source = (await listBookingSources()).find((item) => item.id === body.id);
    if (!source) {
      return NextResponse.json({ error: "Booking source not found." }, { status: 404 });
    }

    const result = await syncBookingSource(source);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sync booking source." },
      { status: 500 },
    );
  }
}
