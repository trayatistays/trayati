import type { PricingConfig } from "@/data/featured-stays";

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  cleaningFeeType: "percentage",
  cleaningFeeValue: 15,
  serviceFeeType: "percentage",
  serviceFeeValue: 5,
  gstPercentage: 18,
  extraGuestFee: 0,
  extraGuestThreshold: 2,
};

export type PricingBreakdown = {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  gstAmount: number;
  extraGuestFee: number;
  discountAmount?: number;
  total: number;
};

export function calculatePricing(
  nightlyRate: number,
  nights: number,
  guests: number = 1,
  config?: PricingConfig | null,
): PricingBreakdown {
  const cfg = config ?? DEFAULT_PRICING_CONFIG;
  
  const subtotal = nightlyRate * nights;
  
  let cleaningFee: number;
  if (cfg.cleaningFeeType === "percentage") {
    cleaningFee = Math.round(nightlyRate * (cfg.cleaningFeeValue / 100));
  } else {
    cleaningFee = cfg.cleaningFeeValue;
  }
  
  let serviceFee: number;
  if (cfg.serviceFeeType === "percentage") {
    serviceFee = Math.round(subtotal * (cfg.serviceFeeValue / 100));
  } else {
    serviceFee = cfg.serviceFeeValue;
  }
  
  const taxableAmount = subtotal + serviceFee;
  const gstAmount = Math.round(taxableAmount * (cfg.gstPercentage / 100));
  
  let extraGuestFee = 0;
  if (guests > cfg.extraGuestThreshold && cfg.extraGuestFee > 0) {
    extraGuestFee = (guests - cfg.extraGuestThreshold) * cfg.extraGuestFee * nights;
  }
  
  const total = subtotal + cleaningFee + serviceFee + gstAmount + extraGuestFee;
  
  return {
    nightlyRate,
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    gstAmount,
    extraGuestFee,
    total,
  };
}

export function formatPricingBreakdown(breakdown: PricingBreakdown): string[] {
  const lines: string[] = [];
  lines.push(`Nightly rate: ₹${breakdown.nightlyRate.toLocaleString()}`);
  lines.push(`Nights: ${breakdown.nights}`);
  lines.push(`Subtotal: ₹${breakdown.subtotal.toLocaleString()}`);
  lines.push(`Cleaning fee: ₹${breakdown.cleaningFee.toLocaleString()}`);
  lines.push(`Service fee: ₹${breakdown.serviceFee.toLocaleString()}`);
  lines.push(`GST: ₹${breakdown.gstAmount.toLocaleString()}`);
  if (breakdown.extraGuestFee > 0) {
    lines.push(`Extra guest fee: ₹${breakdown.extraGuestFee.toLocaleString()}`);
  }
  lines.push(`Total: ₹${breakdown.total.toLocaleString()}`);
  return lines;
}
