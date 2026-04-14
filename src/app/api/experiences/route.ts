import { NextResponse } from "next/server";
import { dbGetAllExperiences } from "@/lib/db";

const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const experiences = await dbGetAllExperiences(true);
    return NextResponse.json(
      { experiences },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
          CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load experiences." },
      { status: 500 },
    );
  }
}
