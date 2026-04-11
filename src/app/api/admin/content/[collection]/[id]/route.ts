import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  isContentCollection,
  removeContentItem,
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

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/content/[collection]/[id]">,
) {
  const { collection, id } = await context.params;

  if (!isContentCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = schemaByCollection[collection].safeParse({
    ...(await request.json()),
    id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const item = await saveContentItem(collection, parsed.data);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update content item.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/content/[collection]/[id]">,
) {
  const { collection, id } = await context.params;

  if (!isContentCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await removeContentItem(collection, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete content item.",
      },
      { status: 500 },
    );
  }
}
