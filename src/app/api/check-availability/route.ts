import { connection, NextResponse } from "next/server";
import { isRangeAvailable } from "@/lib/booking/availability";
import { checkAvailabilitySchema } from "@/lib/booking/schemas";

export async function POST(request: Request) {
  await connection();
  const parsed = checkAvailabilitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    const result = await isRangeAvailable(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to check availability." },
      { status: 500 },
    );
  }
}
