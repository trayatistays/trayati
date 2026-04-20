import { connection, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteBookingSource, listBookingSources, upsertBookingSource } from "@/lib/booking/db";
import { bookingSourceSchema } from "@/lib/booking/schemas";

export async function GET(request: Request) {
  await connection();
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  try {
    const sources = await listBookingSources(url.searchParams.get("stayId") ?? undefined);
    return NextResponse.json({ sources });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load booking sources." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  await connection();
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = bookingSourceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    const source = await upsertBookingSource(parsed.data);
    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save booking source." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  await connection();
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Source id is required." }, { status: 400 });
  }

  try {
    await deleteBookingSource(body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete booking source." },
      { status: 500 },
    );
  }
}
