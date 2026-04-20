import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listCommissions, updateCommissionStatus } from "@/lib/host";
import { dbGetStayById } from "@/lib/db";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  
  const commissions = await listCommissions(status);
  
  const enrichedCommissions = await Promise.all(
    commissions.map(async (commission) => {
      const stay = await dbGetStayById(commission.stayId);
      return {
        ...commission,
        stayName: stay?.title ?? "Unknown",
      };
    })
  );

  return NextResponse.json({ commissions: enrichedCommissions });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status are required." }, { status: 400 });
  }

  const commission = await updateCommissionStatus(body.id, body.status, body.payoutReference);
  return NextResponse.json({ commission });
}
