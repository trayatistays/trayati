import "server-only";

import crypto from "node:crypto";
import Razorpay from "razorpay";

let razorpay: Razorpay | null = null;

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return { keyId, keySecret };
}

export function getRazorpayClient() {
  if (!razorpay) {
    const { keyId, keySecret } = getCredentials();
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  return razorpay;
}

export function getRazorpayPublicConfig() {
  const { keyId } = getCredentials();
  return { keyId };
}

export function verifyWebhookSignature(payload: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Razorpay webhook secret is not configured.");
  }

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = getCredentials();
  const digest = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(input.signature));
}
