import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

export async function GET() {
  try {
    const supabase = requireSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ submissions: data });
  } catch {
    return NextResponse.json({ submissions: [] });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: "contact" | "connect" | "property-booking";
  };

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  try {
    const supabase = requireSupabaseAdmin();
    const { error } = await supabase.from("contact_messages").insert({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() ?? "",
      message: body.message.trim(),
      source: body.source ?? "contact",
    });

    if (error) throw error;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save message" },
      { status: 500 },
    );
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Trayati Stays <noreply@trayatistays.com>",
        to: process.env.TRAYATI_NOTIFY_EMAIL ?? "ishanchadha9044@gmail.com",
        replyTo: body.email.trim(),
        subject: `New ${body.source ?? "contact"} enquiry from ${body.name.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#4A6544;margin-bottom:4px">New Enquiry — Trayati Stays</h2>
            <p style="color:#8A8A8A;font-size:12px;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.1em">
              Source: ${body.source ?? "contact form"}
            </p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#8A8A8A;font-size:13px;width:80px">Name</td><td style="padding:8px 0;font-weight:600">${body.name.trim()}</td></tr>
              <tr><td style="padding:8px 0;color:#8A8A8A;font-size:13px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${body.email.trim()}" style="color:#A46C2B">${body.email.trim()}</a></td></tr>
              ${body.phone ? `<tr><td style="padding:8px 0;color:#8A8A8A;font-size:13px">Phone</td><td style="padding:8px 0;font-weight:600"><a href="tel:${body.phone.trim()}" style="color:#A46C2B">${body.phone.trim()}</a></td></tr>` : ""}
            </table>
            <div style="margin-top:20px;padding:16px;background:#F5F1E9;border-radius:12px;border-left:3px solid #A46C2B">
              <p style="margin:0;white-space:pre-line;color:#1A1A1A">${body.message.trim()}</p>
            </div>
            <p style="margin-top:24px;font-size:12px;color:#8A8A8A">Reply directly to this email to respond to ${body.name.trim()}.</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn("[Trayati] Resend notification failed:", e);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
