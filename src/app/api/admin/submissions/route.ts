import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    action?: "approve" | "reject";
    adminNotes?: string;
  };

  if (!body.id || !body.action) {
    return NextResponse.json(
      { error: "Missing required fields: id, action" },
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

  const newStatus = body.action === "approve" ? "approved" : "rejected";

  const { error } = await supabase
    .from("property_submissions")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: "admin",
      admin_notes: body.adminNotes || null,
    })
    .eq("id", body.id);

  if (error) {
    console.error("Supabase update error:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };

  if (!body.id) {
    return NextResponse.json(
      { error: "Missing required field: id" },
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

  const { error } = await supabase
    .from("property_submissions")
    .delete()
    .eq("id", body.id);

  if (error) {
    console.error("Supabase delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}