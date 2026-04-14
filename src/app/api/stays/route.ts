import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetAllStays, dbUpsertStay } from "@/lib/db";
import { staySchema } from "@/lib/schemas";

const STAYS_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const stays = await dbGetAllStays(true);
    return NextResponse.json(
      { stays },
      {
        headers: {
          "Cache-Control": STAYS_CACHE_CONTROL,
          CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load stays." },
      { status: 500 },
    );
  }
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

  const stay = await dbUpsertStay(parsed.data);
  return NextResponse.json({ stay }, { status: 201 });
}
