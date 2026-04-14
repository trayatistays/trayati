import "server-only";

import { requireSupabaseAdmin } from "@/lib/supabase-admin";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: "contact" | "connect" | "property-booking";
  createdAt: string;
};

// ── Local file fallback (dev only) ──────────────────────────────────────────
// ── Supabase-backed store ────────────────────────────────────────────────────
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const supabase = requireSupabaseAdmin();

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load contact submissions: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    message: row.message as string,
    source: (row.source as ContactSubmission["source"]) ?? "contact",
    createdAt: row.created_at as string,
  }));
}

export async function addContactSubmission(
  submission: ContactSubmission,
): Promise<ContactSubmission> {
  const supabase = requireSupabaseAdmin();

  const { error } = await supabase.from("contact_submissions").insert({
    id: submission.id,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    message: submission.message,
    source: submission.source,
    created_at: submission.createdAt,
  });

  if (error) {
    throw new Error(`Unable to save contact submission: ${error.message}`);
  }

  return submission;
}
