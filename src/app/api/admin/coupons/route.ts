import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  dbGetAllCoupons,
  dbCreateCoupon,
  dbGetCouponStats,
} from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [coupons, stats] = await Promise.all([
      dbGetAllCoupons(),
      dbGetCouponStats(),
    ]);
    return NextResponse.json({ coupons, stats });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const coupon = await dbCreateCoupon({
      code: (body.code as string).toUpperCase().trim(),
      discount: Number(body.discount),
      maxUses: Number(body.maxUses),
      expiresAt: body.expiresAt || null,
      isActive: body.isActive !== false,
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
