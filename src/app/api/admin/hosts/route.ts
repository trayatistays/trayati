import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listHosts, updateHostStatus, assignStayToHost } from "@/lib/host";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  
  const hosts = await listHosts(status);
  return NextResponse.json({ hosts });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  
  if (body.hostId && body.stayId) {
    await assignStayToHost(body.stayId, body.hostId, body.ownershipPercentage);
    return NextResponse.json({ success: true });
  }

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status are required." }, { status: 400 });
  }

  const host = await updateHostStatus(body.id, body.status, body.notes);
  return NextResponse.json({ host });
}
