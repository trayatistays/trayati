import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetAllSubmissions, dbUpdateSubmissionStatus, dbGetSubmissionById, dbDeleteSubmission } from "@/lib/db";
import { deleteManagedAssetByUrl } from "@/lib/stay-media";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    action?: "approve" | "reject";
    adminNotes?: string;
  };

  if (!body.id || !body.action) {
    return NextResponse.json(
      { error: "Missing required fields: id, action" },
      { status: 400 },
    );
  }

  try {
    const status = body.action === "approve" ? "approved" as const : "rejected" as const;
    await dbUpdateSubmissionStatus(body.id, status, body.adminNotes);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update submission" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };

  if (!body.id) {
    return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
  }

  try {
    const submission = await dbGetSubmissionById(body.id);
    
    if (submission) {
      const propertyPayload = submission.propertyPayload as Record<string, unknown> | undefined;
      const imageUrl = propertyPayload?.image as string | undefined;
      
      await dbDeleteSubmission(body.id);
      
      if (imageUrl) {
        await deleteManagedAssetByUrl(imageUrl).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete submission" },
      { status: 500 },
    );
  }
}
