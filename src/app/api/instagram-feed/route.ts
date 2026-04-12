import { NextResponse } from "next/server";
import { getInstagramFeed } from "@/lib/instagram";

export async function GET() {
  const items = await getInstagramFeed();

  return NextResponse.json({
    items,
    usingFallback: !process.env.INSTAGRAM_ACCESS_TOKEN,
  });
}
