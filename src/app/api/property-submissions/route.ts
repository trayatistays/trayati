import { NextResponse } from "next/server";
import { dbCreateSubmission, dbGetAllSubmissions } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    clerkUserId?: string;
    userName?: string;
    userEmail?: string;
    property?: unknown;
  };

  if (!body.clerkUserId || !body.userName || !body.userEmail || !body.property) {
    return NextResponse.json(
      { error: "Missing required fields: clerkUserId, userName, userEmail, property" },
      { status: 400 },
    );
  }

  try {
    const id = `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const submission = await dbCreateSubmission({
      id,
      clerkUserId: body.clerkUserId,
      userName: body.userName,
      userEmail: body.userEmail,
      propertyPayload: body.property as Record<string, unknown>,
      status: "pending",
    });
    return NextResponse.json({ success: true, id: submission.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save submission" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const submissions = await dbGetAllSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
