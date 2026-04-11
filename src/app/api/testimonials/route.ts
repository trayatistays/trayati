import { NextResponse } from "next/server";
import { getContentCollection } from "@/lib/content-data";

export async function GET() {
  const testimonials = await getContentCollection("testimonials");
  return NextResponse.json({ testimonials });
}
