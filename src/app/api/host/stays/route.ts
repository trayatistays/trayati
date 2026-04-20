import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getHostByClerkUserId } from "@/lib/host";
import { getHostStays } from "@/lib/host-portal";

export async function GET() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const host = await getHostByClerkUserId(userId);
  if (!host) {
    return NextResponse.json({ error: "Host not found" }, { status: 404 });
  }

  const stays = await getHostStays(host.id);
  return NextResponse.json({ stays, host });
}
