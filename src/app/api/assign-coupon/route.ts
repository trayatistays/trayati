import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

type CouponRow = {
  id: string;
  code: string;
  discount: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

type UserCouponJoined = {
  id: string;
  user_id: string;
  coupon_id: string;
  assigned_at: string;
  used: boolean;
  coupons_master: CouponRow;
};

const resend = new Resend(process.env.RESEND_API_KEY);

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendCouponEmail(email: string, name: string, code: string, discount: number) {
  try {
    await resend.emails.send({
      from: "Trayati Stays <noreply@trayatistays.com>",
      to: email,
      subject: `🎁 Your ${discount}% off coupon is here!`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#F5F1E9;border-radius:16px;overflow:hidden;">
          <div style="background:#4A6544;padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Trayati Stays</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Your Exclusive Offer</p>
          </div>
          <div style="padding:40px;">
            <p style="margin:0 0 8px;color:#5C5C5C;">Hi ${name || "there"},</p>
            <p style="margin:0 0 28px;color:#1A1A1A;font-size:16px;line-height:1.6;">
              Welcome to Trayati! Here is your <strong>${discount}% OFF</strong> coupon for your first booking:
            </p>
            <div style="background:#fff;border:2px dashed #A46C2B;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
              <p style="margin:0 0 6px;color:#8A8A8A;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Your Coupon Code</p>
              <p style="margin:0;font-family:monospace;font-size:28px;font-weight:700;color:#4A6544;letter-spacing:0.15em;">${code}</p>
              <p style="margin:8px 0 0;color:#A46C2B;font-size:13px;">${discount}% off your first booking</p>
            </div>
            <p style="margin:0;color:#8A8A8A;font-size:13px;line-height:1.6;">Apply this code at checkout. Valid for one booking. We can not wait to host you.</p>
          </div>
          <div style="background:#EFE7DC;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#8A8A8A;font-size:12px;">© 2025 Trayati Stays. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[assign-coupon] Resend error (non-fatal):", err);
  }
}

export async function POST() {
  // 1. Auth — must be signed in
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lockKey = `coupon_lock:${userId}`;

  // 2. Redis distributed lock — prevents duplicate calls within 10s window
  const lockAcquired = await redis.set(lockKey, "1", { nx: true, ex: 10 });
  if (!lockAcquired) {
    return NextResponse.json({ error: "Request already in progress. Please wait." }, { status: 429 });
  }

  try {
    const supabase = requireSupabaseAdmin();

    // 3. Idempotency — check for existing assignment
    const { data: existingRow } = await supabase
      .from("user_coupons")
      .select("*, coupons_master(*)")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingRow) {
      const ex = existingRow as UserCouponJoined;
      return NextResponse.json({
        code: ex.coupons_master.code,
        discount: ex.coupons_master.discount,
        assignedAt: ex.assigned_at,
        alreadyAssigned: true,
      });
    }

    // 4. A/B discount variant: 5–10% random
    const abDiscount = randomInt(5, 10);

    // 5. Pick first available coupon
    //    Supabase RPC not guaranteed, use JS client with optimistic lock safety
    const now = new Date().toISOString();
    const { data: couponsData } = await supabase
      .from("coupons_master")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: true })
      .limit(20);

    const coupon = (couponsData as CouponRow[] | null)?.find(
      (c) => c.used_count < c.max_uses,
    ) ?? null;

    if (!coupon) {
      return NextResponse.json({
        code: null,
        message: "No offers available right now. Check back soon!",
        noPool: true,
      });
    }

    // 6. Insert user_coupon — UNIQUE constraint on user_id prevents race condition duplicate
    const { error: insertError } = await supabase.from("user_coupons").insert({
      user_id: userId,
      coupon_id: coupon.id,
    });

    if (insertError) {
      // Race: another concurrent request won — return their result
      const { data: winner } = await supabase
        .from("user_coupons")
        .select("*, coupons_master(*)")
        .eq("user_id", userId)
        .maybeSingle();
      if (winner) {
        const w = winner as UserCouponJoined;
        return NextResponse.json({
          code: w.coupons_master.code,
          discount: w.coupons_master.discount,
          assignedAt: w.assigned_at,
          alreadyAssigned: true,
        });
      }
      return NextResponse.json({ error: "Assignment failed. Please try again." }, { status: 500 });
    }

    // 7. Increment usage counter
    await supabase
      .from("coupons_master")
      .update({ used_count: coupon.used_count + 1 })
      .eq("id", coupon.id);

    // 8. Non-blocking: update Clerk metadata + send email
    const clerk = await clerkClient();
    void clerk.users
      .updateUserMetadata(userId, { publicMetadata: { hasCoupon: true } })
      .catch((e) => console.error("[assign-coupon] Clerk metadata:", e));

    void clerk.users
      .getUser(userId)
      .then((user) => {
        const email = user.emailAddresses?.[0]?.emailAddress ?? "";
        const name = user.firstName ?? user.username ?? "";
        if (email) sendCouponEmail(email, name, coupon.code, abDiscount);
      })
      .catch((e) => console.error("[assign-coupon] Clerk getUser:", e));

    return NextResponse.json({
      code: coupon.code,
      discount: abDiscount,
      assignedAt: new Date().toISOString(),
      alreadyAssigned: false,
    });
  } finally {
    await redis.del(lockKey).catch(() => {});
  }
}
