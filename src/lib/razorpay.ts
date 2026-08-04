import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Built on first use, not at import time.
 *
 * The Razorpay constructor throws when `key_id` is missing, so constructing it
 * eagerly would take down every route that merely imports the payment actions —
 * including the bill page, which must keep working for cash-at-counter even
 * when online payments aren't configured.
 */
export function getRazorpay(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error(
      "Online payments aren't configured — RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing.",
    );
  }
  client ??= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return client;
}
