import { NextResponse } from "next/server";
import { addContactSubmission, getContactSubmissions } from "@/lib/contact-store";

export async function GET() {
  const submissions = await getContactSubmissions();
  return NextResponse.json({ submissions });
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

  const submission = await addContactSubmission({
    id: crypto.randomUUID(),
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() ?? "",
    message: body.message.trim(),
    source: body.source ?? "contact",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ submission }, { status: 201 });
}
