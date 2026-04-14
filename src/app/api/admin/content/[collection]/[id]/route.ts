import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbUpsertStay, dbDeleteStay, dbUpsertTestimonial, dbDeleteTestimonial, dbUpsertExperience, dbDeleteExperience } from "@/lib/db";
import { staySchema, testimonialSchema, experienceSchema } from "@/lib/schemas";

type Collection = "stays" | "testimonials" | "experiences" | "reservations";

function isValidCollection(input: string): input is Collection {
  return ["stays", "testimonials", "experiences", "reservations"].includes(input);
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/content/[collection]/[id]">,
) {
  const { collection, id } = await context.params;

  if (!isValidCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();

  try {
    let item;
    switch (collection) {
      case "stays": {
        const parsed = staySchema.safeParse({ ...body, id });
        if (!parsed.success) return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        item = await dbUpsertStay({ ...parsed.data, id });
        break;
      }
      case "testimonials": {
        const parsed = testimonialSchema.safeParse({ ...body, id });
        if (!parsed.success) return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        item = await dbUpsertTestimonial({ ...parsed.data, id });
        break;
      }
      case "experiences": {
        const parsed = experienceSchema.safeParse({ ...body, id });
        if (!parsed.success) return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        item = await dbUpsertExperience({ ...parsed.data, id });
        break;
      }
      default:
        return NextResponse.json({ error: "Cannot update reservations here." }, { status: 400 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/content/[collection]/[id]">,
) {
  const { collection, id } = await context.params;

  if (!isValidCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    let removed;
    switch (collection) {
      case "stays":
        removed = await dbDeleteStay(id);
        break;
      case "testimonials":
        removed = await dbDeleteTestimonial(id);
        break;
      case "experiences":
        removed = await dbDeleteExperience(id);
        break;
      default:
        return NextResponse.json({ error: "Cannot delete from this collection." }, { status: 400 });
    }

    if (!removed) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete." },
      { status: 500 },
    );
  }
}
