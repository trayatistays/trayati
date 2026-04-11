import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getContentCollection,
  isContentCollection,
  saveContentItem,
} from "@/lib/content-data";
import {
  experienceSchema,
  reservationSchema,
  staySchema,
  testimonialSchema,
} from "@/lib/schemas";

const schemaByCollection = {
  stays: staySchema,
  experiences: experienceSchema,
  testimonials: testimonialSchema,
  reservations: reservationSchema,
} as const;

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/content/[collection]">,
) {
  const { collection } = await context.params;

  if (!isContentCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const items = await getContentCollection(collection);
  return NextResponse.json({ items });
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/content/[collection]">,
) {
  const { collection } = await context.params;

  if (!isContentCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = schemaByCollection[collection].safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const item = await saveContentItem(collection, parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save content item.",
      },
      { status: 500 },
    );
  }
}
