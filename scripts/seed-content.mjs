import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const CONTENT_TABLE = "trayati_content";

function parseEnvFile(raw) {
  const entries = {};

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, value] = match;
    entries[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return entries;
}

async function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const fileEnv = await fs
    .readFile(envPath, "utf8")
    .then(parseEnvFile)
    .catch(() => ({}));

  return {
    ...fileEnv,
    ...process.env,
  };
}

function toRows(collection, items) {
  const now = new Date().toISOString();

  return items.map((item) => ({
    collection,
    id: item.id,
    payload: item,
    updated_at: now,
  }));
}

async function seedCollection(supabase, collection, items) {
  const { count, error: countError } = await supabase
    .from(CONTENT_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("collection", collection);

  if (countError) {
    throw new Error(
      `Unable to inspect ${collection} before seeding: ${countError.message}`,
    );
  }

  if ((count ?? 0) > 0) {
    return {
      collection,
      status: "skipped",
      count,
    };
  }

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .upsert(toRows(collection, items), { onConflict: "collection,id" });

  if (error) {
    throw new Error(`Unable to seed ${collection}: ${error.message}`);
  }

  return {
    collection,
    status: "seeded",
    count: items.length,
  };
}

async function main() {
  const env = await loadEnv();
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const [{ featuredStays }, { experiences, testimonials }] = await Promise.all([
    import(
      pathToFileURL(
        path.join(process.cwd(), "src/data/featured-stays.ts"),
      ).href
    ),
    import(
      pathToFileURL(
        path.join(process.cwd(), "src/data/testimonials-and-blogs.ts"),
      ).href
    ),
  ]);

  const results = [];
  results.push(await seedCollection(supabase, "stays", featuredStays));
  results.push(await seedCollection(supabase, "experiences", experiences));
  results.push(await seedCollection(supabase, "testimonials", testimonials));

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown seed failure.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
