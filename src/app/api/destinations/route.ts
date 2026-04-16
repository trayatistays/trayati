import { NextResponse } from "next/server";
import { dbGetAllDestinations } from "@/lib/db";

const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const destinations = await dbGetAllDestinations(true);
    return NextResponse.json(
      { destinations },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
          CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load destinations." },
      { status: 500 },
    );
  }
}
