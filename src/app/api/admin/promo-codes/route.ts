import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listPromoCodes, createPromoCode } from "@/lib/promo-code";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const promoCodes = await listPromoCodes();
  return NextResponse.json({ promoCodes });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const promoCode = await createPromoCode({
    code: body.code,
    description: body.description,
    discountType: body.discountType,
    discountValue: body.discountValue,
    minBookingAmount: body.minBookingAmount,
    maxDiscountAmount: body.maxDiscountAmount,
    usageLimit: body.usageLimit,
    validFrom: body.validFrom,
    validUntil: body.validUntil,
    applicableStayIds: body.applicableStayIds,
  });

  return NextResponse.json({ promoCode }, { status: 201 });
}
