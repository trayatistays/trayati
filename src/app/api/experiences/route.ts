import { NextResponse } from "next/server";
import { getContentCollection } from "@/lib/content-data";

export async function GET() {
  const experiences = await getContentCollection("experiences");
  return NextResponse.json({ experiences });
}
