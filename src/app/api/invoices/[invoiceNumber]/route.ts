import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getInvoiceByNumber, generateInvoiceHtml, generateInvoiceText } from "@/lib/invoice";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> },
) {
  const { invoiceNumber } = await params;
  const { isAuthenticated, userId } = await auth();
  const isAdmin = await isAdminAuthenticated();

  if (!isAuthenticated && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await getInvoiceByNumber(invoiceNumber);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!isAdmin && invoice.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const acceptHeader = _request.headers.get("accept") ?? "";
  
  if (acceptHeader.includes("text/html")) {
    return new NextResponse(generateInvoiceHtml(invoice), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  if (acceptHeader.includes("text/plain")) {
    return new NextResponse(generateInvoiceText(invoice), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.json({ invoice });
}
