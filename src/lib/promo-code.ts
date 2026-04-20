import "server-only";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { PromoCode } from "@/lib/types";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result as T;
}

export async function validatePromoCode(
  code: string,
  stayId: string,
  bookingAmount: number,
): Promise<{ valid: boolean; promoCode?: PromoCode; error?: string }> {
  const supabase = requireSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid promo code." };
  }

  const promo = toCamelCase<PromoCode>(data as Record<string, unknown>);
  const now = new Date().toISOString().split("T")[0];

  if (promo.validFrom > now || promo.validUntil < now) {
    return { valid: false, error: "Promo code has expired." };
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return { valid: false, error: "Promo code usage limit reached." };
  }

  if (promo.minBookingAmount > 0 && bookingAmount < promo.minBookingAmount) {
    return { valid: false, error: `Minimum booking amount is ₹${promo.minBookingAmount.toLocaleString()}.` };
  }

  if (promo.applicableStayIds.length > 0 && !promo.applicableStayIds.includes(stayId)) {
    return { valid: false, error: "Promo code not applicable for this property." };
  }

  return { valid: true, promoCode: promo };
}

export function calculateDiscount(promoCode: PromoCode, amount: number): number {
  let discount: number;
  
  if (promoCode.discountType === "percentage") {
    discount = Math.round((amount * promoCode.discountValue) / 100);
  } else {
    discount = promoCode.discountValue;
  }

  if (promoCode.maxDiscountAmount !== null) {
    discount = Math.min(discount, promoCode.maxDiscountAmount);
  }

  return Math.min(discount, amount);
}

export async function incrementPromoCodeUsage(promoCodeId: string): Promise<void> {
  const supabase = requireSupabaseAdmin();
  
  try {
    await supabase.rpc("increment_promo_usage", { promo_id: promoCodeId });
  } catch {
    const { data } = await supabase
      .from("promo_codes")
      .select("usage_count")
      .eq("id", promoCodeId)
      .single();
    
    if (data) {
      await supabase
        .from("promo_codes")
        .update({ usage_count: (data.usage_count ?? 0) + 1 })
        .eq("id", promoCodeId);
    }
  }
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load promo codes: ${error.message}`);
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => toCamelCase<PromoCode>(row));
}

export async function createPromoCode(input: {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  applicableStayIds?: string[];
}): Promise<PromoCode> {
  const supabase = requireSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: input.code.toUpperCase(),
      description: input.description ?? null,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      min_booking_amount: input.minBookingAmount ?? 0,
      max_discount_amount: input.maxDiscountAmount ?? null,
      usage_limit: input.usageLimit ?? null,
      valid_from: input.validFrom,
      valid_until: input.validUntil,
      applicable_stay_ids: input.applicableStayIds ?? [],
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create promo code: ${error.message}`);
  }

  return toCamelCase<PromoCode>(data as Record<string, unknown>);
}

export async function updatePromoCode(
  id: string,
  input: Partial<{
    code: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minBookingAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    applicableStayIds: string[];
  }>,
): Promise<PromoCode> {
  const supabase = requireSupabaseAdmin();
  
  const updateData: Record<string, unknown> = {};
  if (input.code !== undefined) updateData.code = input.code.toUpperCase();
  if (input.description !== undefined) updateData.description = input.description;
  if (input.discountType !== undefined) updateData.discount_type = input.discountType;
  if (input.discountValue !== undefined) updateData.discount_value = input.discountValue;
  if (input.minBookingAmount !== undefined) updateData.min_booking_amount = input.minBookingAmount;
  if (input.maxDiscountAmount !== undefined) updateData.max_discount_amount = input.maxDiscountAmount;
  if (input.usageLimit !== undefined) updateData.usage_limit = input.usageLimit;
  if (input.validFrom !== undefined) updateData.valid_from = input.validFrom;
  if (input.validUntil !== undefined) updateData.valid_until = input.validUntil;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;
  if (input.applicableStayIds !== undefined) updateData.applicable_stay_ids = input.applicableStayIds;

  const { data, error } = await supabase
    .from("promo_codes")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update promo code: ${error.message}`);
  }

  return toCamelCase<PromoCode>(data as Record<string, unknown>);
}

export async function deletePromoCode(id: string): Promise<void> {
  const supabase = requireSupabaseAdmin();
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete promo code: ${error.message}`);
  }
}
