import { NextResponse } from "next/server";
import { validatePromoCode, calculateDiscount } from "@/lib/promo-code";

export async function POST(request: Request) {
  const body = await request.json();
  const { code, stayId, bookingAmount } = body;

  if (!code || !stayId || !bookingAmount) {
    return NextResponse.json(
      { error: "code, stayId, and bookingAmount are required." },
      { status: 400 }
    );
  }

  const result = await validatePromoCode(code, stayId, bookingAmount);

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
  }

  const discountAmount = calculateDiscount(result.promoCode!, bookingAmount);

  return NextResponse.json({
    valid: true,
    promoCode: {
      code: result.promoCode!.code,
      discountType: result.promoCode!.discountType,
      discountValue: result.promoCode!.discountValue,
      maxDiscountAmount: result.promoCode!.maxDiscountAmount,
    },
    discountAmount,
    finalAmount: bookingAmount - discountAmount,
  });
}
