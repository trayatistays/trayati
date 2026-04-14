import { NextResponse } from "next/server";
import { dbGetAllTestimonials } from "@/lib/db";

const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const testimonials = await dbGetAllTestimonials(true);
    return NextResponse.json(
      { testimonials },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
          CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load testimonials." },
      { status: 500 },
    );
  }
}
