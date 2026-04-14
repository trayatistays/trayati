import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetStayById, dbUpsertStay, dbDeleteStay } from "@/lib/db";
import { staySchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/stays/[id]">,
) {
  const { id } = await context.params;

  try {
    const stay = await dbGetStayById(id);
    if (!stay) {
      return NextResponse.json({ error: "Stay not found." }, { status: 404 });
    }
    return NextResponse.json({ stay }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load stay." },
      { status: 500 },
    );
  }
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

  const stay = await dbUpsertStay({ ...parsed.data, id });

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
  const deleted = await dbDeleteStay(id);

  if (!deleted) {
    return NextResponse.json({ error: "Stay not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
