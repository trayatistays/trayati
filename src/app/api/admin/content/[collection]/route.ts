import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetAllStays, dbUpsertStay, dbGetAllTestimonials, dbUpsertTestimonial, dbGetAllExperiences, dbUpsertExperience, dbGetAllReservations } from "@/lib/db";
import { staySchema, testimonialSchema, experienceSchema } from "@/lib/schemas";

type Collection = "stays" | "testimonials" | "experiences" | "reservations";

function isValidCollection(input: string): input is Collection {
  return ["stays", "testimonials", "experiences", "reservations"].includes(input);
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/content/[collection]">,
) {
  const { collection } = await context.params;

  if (!isValidCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    let items;
    switch (collection) {
      case "stays":
        items = await dbGetAllStays();
        break;
      case "testimonials":
        items = await dbGetAllTestimonials();
        break;
      case "experiences":
        items = await dbGetAllExperiences();
        break;
      case "reservations":
        items = await dbGetAllReservations();
        break;
    }
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load content." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/content/[collection]">,
) {
  const { collection } = await context.params;

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
        const parsed = staySchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        item = await dbUpsertStay(parsed.data);
        break;
      }
      case "testimonials": {
        const parsed = testimonialSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        item = await dbUpsertTestimonial(parsed.data);
        break;
      }
      case "experiences": {
        const parsed = experienceSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        item = await dbUpsertExperience(parsed.data);
        break;
      }
      default:
        return NextResponse.json({ error: "Cannot create reservations here." }, { status: 400 });
    }
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save." },
      { status: 500 },
    );
  }
}
