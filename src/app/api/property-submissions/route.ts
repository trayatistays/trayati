import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbCreateSubmission, dbGetAllSubmissions } from "@/lib/db";
import { propertySubmissionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json(
      { error: "Sign in to submit a property." },
      { status: 401 },
    );
  }

  const parsed = propertySubmissionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.prettifyError(parsed.error) },
      { status: 400 },
    );
  }

  let userName = "";
  let userEmail = "";

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    userName = [
      clerkUser.firstName,
      clerkUser.lastName,
    ].filter(Boolean).join(" ") || clerkUser.username || "";
    const emailObj = clerkUser.emailAddresses.find(
      (e: { id: string | null }) => e.id === clerkUser.primaryEmailAddressId,
    );
    userEmail = emailObj?.emailAddress ?? "";
  } catch {
    userName = "";
    userEmail = "";
  }

  try {
    const id = `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const submission = await dbCreateSubmission({
      id,
      clerkUserId: userId,
      userName,
      userEmail,
      propertyPayload: parsed.data.property as Record<string, unknown>,
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
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
