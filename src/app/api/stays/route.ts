import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createStay, getAllStays } from "@/lib/stays-store";
import { staySchema } from "@/lib/schemas";

export async function GET() {
  const stays = await getAllStays();
  return NextResponse.json({ stays });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = staySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  const stay = await createStay(parsed.data);
  return NextResponse.json({ stay }, { status: 201 });
}
