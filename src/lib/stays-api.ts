"use server";

import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { FeaturedStay } from "@/data/featured-stays";
import { dbRowToStay } from "@/lib/db";

export async function getStayById(id: string): Promise<FeaturedStay | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("stays")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch stay ${id}: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return dbRowToStay(data);
}

export async function getStayBySlug(slug: string): Promise<FeaturedStay | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("stays")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch stay by slug ${slug}: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return dbRowToStay(data);
}