import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createReview, listReviewsByStayId, getReviewByBookingId, listAllReviews, respondToReview } from "@/lib/review";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getBookingById } from "@/lib/booking/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stayId = searchParams.get("stayId");
  const bookingId = searchParams.get("bookingId");
  const all = searchParams.get("all");

  if (all === "true" && (await isAdminAuthenticated())) {
    const reviews = await listAllReviews();
    return NextResponse.json({ reviews });
  }

  if (bookingId) {
    const review = await getReviewByBookingId(bookingId);
    return NextResponse.json({ review });
  }

  if (stayId) {
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const reviews = await listReviewsByStayId(stayId, limit);
    return NextResponse.json({ reviews });
  }

  return NextResponse.json({ error: "stayId or bookingId is required." }, { status: 400 });
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  
  if (!body.bookingId || !body.rating) {
    return NextResponse.json({ error: "bookingId and rating are required." }, { status: 400 });
  }

  const booking = await getBookingById(body.bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Can only review confirmed bookings." }, { status: 400 });
  }

  const existingReview = await getReviewByBookingId(body.bookingId);
  if (existingReview) {
    return NextResponse.json({ error: "Review already exists for this booking." }, { status: 400 });
  }

  const review = await createReview({
    bookingId: body.bookingId,
    stayId: booking.stayId,
    userId,
    rating: body.rating,
    cleanlinessRating: body.cleanlinessRating,
    locationRating: body.locationRating,
    valueRating: body.valueRating,
    title: body.title,
    comment: body.comment,
  });

  return NextResponse.json({ review }, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  
  if (!body.reviewId || !body.response) {
    return NextResponse.json({ error: "reviewId and response are required." }, { status: 400 });
  }

  const review = await respondToReview(body.reviewId, body.response);
  return NextResponse.json({ review });
}
