import { NextResponse } from "next/server";
import { createStay, getAllStays } from "@/lib/stays-store";
import type { FeaturedStay } from "@/data/featured-stays";

export async function GET() {
  const stays = await getAllStays();
  return NextResponse.json({ stays });
}

export async function POST(request: Request) {
  const body = (await request.json()) as FeaturedStay;

  if (!body?.id || !body?.title) {
    return NextResponse.json(
      { error: "A valid stay payload is required." },
      { status: 400 },
    );
  }

  const stay = await createStay(body);
  return NextResponse.json({ stay }, { status: 201 });
}
