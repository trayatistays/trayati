import { NextResponse } from "next/server";
import { deleteStay, getStayById, updateStay } from "@/lib/stays-store";
import type { FeaturedStay } from "@/data/featured-stays";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/stays/[id]">,
) {
  const { id } = await context.params;
  const stay = await getStayById(id);

  if (!stay) {
    return NextResponse.json({ error: "Stay not found." }, { status: 404 });
  }

  return NextResponse.json({ stay });
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/stays/[id]">,
) {
  const { id } = await context.params;
  const body = (await request.json()) as FeaturedStay;
  const stay = await updateStay(id, body);

  if (!stay) {
    return NextResponse.json({ error: "Stay not found." }, { status: 404 });
  }

  return NextResponse.json({ stay });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/stays/[id]">,
) {
  const { id } = await context.params;
  const deleted = await deleteStay(id);

  if (!deleted) {
    return NextResponse.json({ error: "Stay not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
