import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
const contactFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "contact-submissions.json",
);

type ContactPayload = {
  submissions: ContactSubmission[];
  updatedAt: string;
};

async function ensureDirectory() {
  await fs.mkdir(path.dirname(contactFilePath), { recursive: true });
}

async function readLocalPayload(): Promise<ContactPayload> {
  try {
    const raw = await fs.readFile(contactFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ContactPayload>;
    if (Array.isArray(parsed.submissions)) {
      return {
        submissions: parsed.submissions,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    // Seed on first write.
  }
  return { submissions: [], updatedAt: new Date().toISOString() };
}

async function writeLocalPayload(submissions: ContactSubmission[]) {
  await ensureDirectory();
  await fs.writeFile(
    contactFilePath,
    JSON.stringify({ submissions, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

// ── Supabase-backed store ────────────────────────────────────────────────────
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        phone: (row.phone as string) ?? "",
        message: row.message as string,
        source: (row.source as ContactSubmission["source"]) ?? "contact",
        createdAt: row.created_at as string,
      }));
    }

    console.warn("[Trayati] Supabase contact_submissions read failed:", error?.message);
  }

  // Fallback to local file (dev / if Supabase table not yet created)
  const payload = await readLocalPayload();
  return payload.submissions;
}

export async function addContactSubmission(
  submission: ContactSubmission,
): Promise<ContactSubmission> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      message: submission.message,
      source: submission.source,
      created_at: submission.createdAt,
    });

    if (!error) {
      return submission;
    }

    console.warn(
      "[Trayati] Supabase contact insert failed, falling back to local file:",
      error.message,
    );
  }

  // Fallback to local file
  const existing = await readLocalPayload();
  await writeLocalPayload([submission, ...existing.submissions]);
  return submission;
}
