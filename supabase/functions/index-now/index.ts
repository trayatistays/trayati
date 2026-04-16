import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEFAULT_SITE_URL = "https://www.trayatistays.com";
const DEFAULT_INDEXNOW_KEY = "237d242c644d47ac8eafcf691957b4ef";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WebhookPayload = {
  table?: string;
  type?: string;
  record?: {
    id?: string;
    title?: string;
    slug?: string;
    is_active?: boolean;
  };
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getSiteOrigin() {
  const configuredUrl = Deno.env.get("SITE_URL") ?? Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? DEFAULT_SITE_URL;
  return new URL(configuredUrl).origin;
}

function getContentPath(payload: WebhookPayload) {
  const record = payload.record;
  if (!record) return null;

  if (record.is_active === false) return null;

  if (payload.table === "stays") {
    return record.id ? `/property/${record.id}` : null;
  }

  const slug = record.slug ?? slugify(record.title ?? record.id ?? "");
  if (!slug) return null;

  return `/blogs/${slug}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: WebhookPayload;

  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contentPath = getContentPath(payload);
  if (!contentPath) {
    return new Response(JSON.stringify({ skipped: true, reason: "No indexable record URL" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const siteOrigin = getSiteOrigin();
  const host = new URL(siteOrigin).host;
  const key = Deno.env.get("INDEXNOW_KEY") ?? DEFAULT_INDEXNOW_KEY;
  const newUrl = `${siteOrigin}${contentPath}`;

  const indexNowPayload = {
    host,
    key,
    keyLocation: `${siteOrigin}/${key}.txt`,
    urlList: [newUrl],
  };

  const indexNowResponse = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload),
  });

  return new Response(
    JSON.stringify({
      status: indexNowResponse.status,
      url: newUrl,
    }),
    {
      status: indexNowResponse.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
