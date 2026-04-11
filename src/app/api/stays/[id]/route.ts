import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteStay, getStayById, updateStay } from "@/lib/stays-store";
import { staySchema } from "@/lib/schemas";

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
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const parsed = staySchema.safeParse({ ...(await request.json()), id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  const stay = await updateStay(id, parsed.data);

  if (!stay) {
    return NextResponse.json({ error: "Stay not found." }, { status: 404 });
  }

  return NextResponse.json({ stay });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/stays/[id]">,
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteStay(id);

  if (!deleted) {
    return NextResponse.json({ error: "Stay not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
