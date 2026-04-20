import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getHostByClerkUserId } from "@/lib/host";
import { getHostEarnings } from "@/lib/host-portal";

export async function GET() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const host = await getHostByClerkUserId(userId);
  if (!host || host.status !== "approved") {
    return NextResponse.json({ error: "Host not found or not approved" }, { status: 403 });
  }

  const earnings = await getHostEarnings(host.id);
  return NextResponse.json(earnings);
}
