"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function createRazorpayOrder(amountRupees: number) {
  const order = await razorpay.orders.create({
    amount: Math.round(amountRupees * 100),
    currency: "INR",
    receipt: `table-${Date.now()}`,
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

export async function verifyAndMarkPaid(
  tableId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    throw new Error("Payment verification failed");
  }

  await prisma.order.updateMany({
    where: { tableId, paymentStatus: "PENDING" },
    data: {
      paymentStatus: "PAID",
      paymentMode: "ONLINE",
      razorpayOrderId,
      razorpayPaymentId,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
