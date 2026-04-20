import { auth } from "@clerk/nextjs/server";
import { connection, NextResponse } from "next/server";
import { releaseBookingLockRecord } from "@/lib/booking/db";
import { invalidateAvailabilityCache } from "@/lib/booking/cache";
import { getRedisLock, releaseRedisLock } from "@/lib/booking/lock";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(request: Request) {
  await connection();
  
  const { isAuthenticated } = await auth();
  const isAdmin = await isAdminAuthenticated();
  
  if (!isAuthenticated && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { lockId?: string; sessionId?: string };
  if (!body.lockId) {
    return NextResponse.json({ error: "lockId is required." }, { status: 400 });
  }

  try {
    const lock = await getRedisLock(body.lockId);
    
    if (!lock) {
      return NextResponse.json({ success: true });
    }

    if (!isAdmin && body.sessionId && lock.sessionId !== body.sessionId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await releaseRedisLock(lock);
    await releaseBookingLockRecord(lock.id);
    await invalidateAvailabilityCache(lock.stayId, lock.roomId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to release lock." },
      { status: 500 },
    );
  }
}
