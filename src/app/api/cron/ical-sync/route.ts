import { connection, NextResponse } from "next/server";
import { syncAllBookingSources } from "@/lib/booking/ical";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  await connection();
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const results = await syncAllBookingSources();
    return NextResponse.json({
      ok: true,
      processedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sync iCal feeds." },
      { status: 500 },
    );
  }
}
