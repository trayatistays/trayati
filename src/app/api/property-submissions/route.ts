import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    clerkUserId?: string;
    userName?: string;
    userEmail?: string;
    property?: unknown;
    status?: string;
    submittedAt?: string;
  };

  if (!body.clerkUserId || !body.userName || !body.userEmail || !body.property) {
    return NextResponse.json(
      { error: "Missing required fields: clerkUserId, userName, userEmail, property" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 },
    );
  }

  const id = `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { error } = await supabase.from("property_submissions").insert({
    id,
    clerk_user_id: body.clerkUserId,
    user_name: body.userName,
    user_email: body.userEmail,
    property_payload: body.property,
    status: "pending",
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Failed to save property submission" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, id }, { status: 201 });
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("property_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Supabase select error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }

  return NextResponse.json({ submissions: data });
}