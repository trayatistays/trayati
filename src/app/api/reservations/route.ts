import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { saveContentItem } from "@/lib/content-data";
import { reservationSchema } from "@/lib/schemas";

const reservationRequestSchema = reservationSchema.omit({
  id: true,
  clerkUserId: true,
  status: true,
  createdAt: true,
});

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Sign in to reserve this stay." }, { status: 401 });
  }

  const parsed = reservationRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  const reservation = reservationSchema.parse({
    ...parsed.data,
    id: crypto.randomUUID(),
    clerkUserId: userId,
    status: "requested",
    createdAt: new Date().toISOString(),
  });

  try {
    await saveContentItem("reservations", reservation);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create reservation.",
      },
      { status: 500 },
    );
  }
}
