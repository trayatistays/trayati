import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetAllDestinations, dbUpsertDestination, dbDeleteDestination, Destination } from "@/lib/db";

const destinationSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const destinations = await dbGetAllDestinations(false);
    return NextResponse.json({ destinations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load destinations." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const parsed = destinationSchema.safeParse({
      ...body,
      id: body.id || `dest-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString(),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
    }
    
    const destination: Destination = {
      id: parsed.data.id,
      name: parsed.data.name,
      isActive: parsed.data.isActive,
      sortOrder: parsed.data.sortOrder,
      createdAt: body.createdAt || new Date().toISOString(),
    };
    
    const item = await dbUpsertDestination(destination);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save destination." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Destination ID is required." }, { status: 400 });
  }

  try {
    const removed = await dbDeleteDestination(id);
    if (!removed) {
      return NextResponse.json({ error: "Destination not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete destination." },
      { status: 500 },
    );
  }
}
