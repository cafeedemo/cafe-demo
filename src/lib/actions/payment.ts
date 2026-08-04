"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";

export async function createRazorpayOrder(sessionId: string, amountRupees: number) {
  const order = await getRazorpay().orders.create({
    amount: Math.round(amountRupees * 100),
    currency: "INR",
    receipt: `session-${sessionId.slice(-12)}`,
  });

  await prisma.diningSession.update({
    where: { id: sessionId },
    data: { razorpayOrderId: order.id },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

export async function verifyOnlinePayment(
  sessionId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Cannot verify payment — RAZORPAY_KEY_SECRET is missing.");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    throw new Error("Payment verification failed");
  }

  const session = await prisma.diningSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Session not found");

  // An online payment settles the bill and frees the table immediately —
  // no staff step needed, unlike paying at the counter.
  await prisma.$transaction(async (tx) => {
    await tx.diningSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        paymentStatus: "PAID",
        paymentMode: "ONLINE",
        razorpayOrderId,
        razorpayPaymentId,
        closedAt: new Date(),
      },
    });

    if (session.reservationId) {
      await tx.reservation.update({
        where: { id: session.reservationId },
        data: { status: "COMPLETED" },
      });
    }
  });

  revalidatePath("/admin/floor");
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
