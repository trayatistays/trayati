import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  cachedClient ??= createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

export function requireSupabaseAdmin() {
  const client = getSupabaseAdmin();

  if (client) {
    return client;
  }

  throw new Error(
    "Supabase admin credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using admin or content APIs.",
  );
}
