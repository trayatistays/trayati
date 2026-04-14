import { NextResponse } from "next/server";
import { getInstagramFeed } from "@/lib/instagram";

const CACHE_CONTROL = "public, s-maxage=1800, stale-while-revalidate=43200";

export async function GET() {
  try {
    const items = await getInstagramFeed();

    return NextResponse.json(
      {
        items,
        usingFallback: !process.env.INSTAGRAM_ACCESS_TOKEN,
      },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
          CDNCacheControl: "public, max-age=1800, stale-while-revalidate=43200",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Instagram feed.",
      },
      { status: 500 },
    );
  }
}
