import "server-only";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { Review } from "@/lib/types";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result as T;
}

export async function createReview(input: {
  bookingId: string;
  stayId: string;
  userId: string;
  rating: number;
  cleanlinessRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  comment?: string;
}): Promise<Review> {
  const supabase = requireSupabaseAdmin();
  
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", input.bookingId)
    .maybeSingle();

  if (existing) {
    throw new Error("A review already exists for this booking.");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      booking_id: input.bookingId,
      stay_id: input.stayId,
      user_id: input.userId,
      rating: input.rating,
      cleanliness_rating: input.cleanlinessRating ?? null,
      location_rating: input.locationRating ?? null,
      value_rating: input.valueRating ?? null,
      title: input.title ?? null,
      comment: input.comment ?? null,
      is_published: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create review: ${error.message}`);
  }

  await updateStayRating(input.stayId);

  return toCamelCase<Review>(data as Record<string, unknown>);
}

export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get review: ${error.message}`);
  }

  return data ? toCamelCase<Review>(data as Record<string, unknown>) : null;
}

export async function listReviewsByStayId(stayId: string, limit: number = 10): Promise<Review[]> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("stay_id", stayId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list reviews: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<Review>(row));
}

export async function listAllReviews(limit: number = 50): Promise<Review[]> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list reviews: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<Review>(row));
}

export async function respondToReview(reviewId: string, response: string): Promise<Review> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .update({
      response,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to respond to review: ${error.message}`);
  }

  return toCamelCase<Review>(data as Record<string, unknown>);
}

export async function toggleReviewPublished(reviewId: string, isPublished: boolean): Promise<Review> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }

  const review = toCamelCase<Review>(data as Record<string, unknown>);
  await updateStayRating(review.stayId);

  return review;
}

export async function getReviewStats(stayId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  cleanlinessAverage: number;
  locationAverage: number;
  valueAverage: number;
  ratingDistribution: Record<number, number>;
}> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating, cleanliness_rating, location_rating, value_rating")
    .eq("stay_id", stayId)
    .eq("is_published", true);

  if (error) {
    throw new Error(`Failed to get review stats: ${error.message}`);
  }

  const reviews = (data ?? []) as Record<string, unknown>[];
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      cleanlinessAverage: 0,
      locationAverage: 0,
      valueAverage: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + ((r.rating as number) ?? 0), 0);
  const totalCleanliness = reviews.reduce((sum, r) => sum + ((r.cleanliness_rating as number) ?? 0), 0);
  const totalLocation = reviews.reduce((sum, r) => sum + ((r.location_rating as number) ?? 0), 0);
  const totalValue = reviews.reduce((sum, r) => sum + ((r.value_rating as number) ?? 0), 0);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const rating = (r.rating as number) ?? 0;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  const countWithRatings = (field: string) => reviews.filter((r) => r[field] !== null).length;

  return {
    averageRating: Number((totalRating / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
    cleanlinessAverage: countWithRatings("cleanliness_rating") > 0 
      ? Number((totalCleanliness / countWithRatings("cleanliness_rating")).toFixed(1)) 
      : 0,
    locationAverage: countWithRatings("location_rating") > 0 
      ? Number((totalLocation / countWithRatings("location_rating")).toFixed(1)) 
      : 0,
    valueAverage: countWithRatings("value_rating") > 0 
      ? Number((totalValue / countWithRatings("value_rating")).toFixed(1)) 
      : 0,
    ratingDistribution: distribution,
  };
}

async function updateStayRating(stayId: string): Promise<void> {
  const supabase = requireSupabaseAdmin();
  
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("stay_id", stayId)
    .eq("is_published", true);

  if (!data || data.length === 0) return;

  const avgRating = data.reduce((sum: number, r) => sum + ((r as Record<string, unknown>).rating as number), 0) / data.length;

  await supabase
    .from("stays")
    .update({ rating: Number(avgRating.toFixed(1)) })
    .eq("id", stayId);
}
