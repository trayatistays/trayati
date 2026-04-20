import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetStaysPaginated, dbGetAllStays, dbUpsertStay } from "@/lib/db";
import { staySchema } from "@/lib/schemas";

const STAYS_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  cursor: z.string().optional(),
  fields: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  experienceType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

const LIST_FIELDS = ["id", "title", "subtitle", "location", "city", "state", "country", "image", "alt", "tag", "type", "experienceType", "rating", "pricePerNight", "basePrice", "isFeatured", "bookingLink", "googleMapsUrl", "description", "roomTypes", "amenities", "address", "pin", "pricingConfig"] as const;

function filterFields<T extends Record<string, unknown>>(obj: T, fields: readonly string[]): Partial<T> {
  const result: Partial<T> = {};
  for (const field of fields) {
    if (field in obj) {
      result[field as keyof T] = obj[field as keyof T];
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      fields: searchParams.get("fields") ?? undefined,
      featured: searchParams.get("featured") ?? undefined,
      experienceType: searchParams.get("experienceType") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      state: searchParams.get("state") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const { limit, cursor, fields, featured, experienceType, city, state } = parsed.data;
    const isMinimal = fields === "minimal";

    if (cursor || featured !== undefined || experienceType || city || state) {
      const result = await dbGetStaysPaginated({
        limit,
        cursor,
        featured,
        experienceType,
        city,
        state,
      });

      const stays = isMinimal
        ? result.stays.map((s) => filterFields(s, LIST_FIELDS))
        : result.stays;

      return NextResponse.json(
        {
          stays,
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
        {
          headers: {
            "Cache-Control": STAYS_CACHE_CONTROL,
            CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    const allStays = await dbGetAllStays(true);
    const stays = isMinimal
      ? allStays.map((s) => filterFields(s, LIST_FIELDS))
      : allStays;

    return NextResponse.json(
      { stays },
      {
        headers: {
          "Cache-Control": STAYS_CACHE_CONTROL,
          CDNCacheControl: "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load stays." },
      { status: 500 }
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
      { status: 400 }
    );
  }

  const stay = await dbUpsertStay(parsed.data);
  return NextResponse.json({ stay }, { status: 201 });
}
