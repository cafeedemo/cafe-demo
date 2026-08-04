"use server";

import crypto from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay";
import { buildSlots, overlaps, slotEnd } from "@/lib/booking-slots";

function revalidateReservationPaths() {
  revalidatePath("/book");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/floor");
  revalidatePath("/admin");
}

async function getSettings() {
  return prisma.siteContent.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

export type SlotAvailability = {
  startISO: string;
  label: string;
  availableTableIds: string[];
};

/**
 * For one date, work out which tables are free in each slot. A table is taken
 * for a slot when an existing reservation's hold window overlaps it.
 */
export async function getAvailability(dateISO: string, partySize = 1) {
  const settings = await getSettings();

  const [y, m, d] = dateISO.split("-").map(Number);
  const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, m - 1, d + 1, 0, 0, 0, 0);

  const [tables, reservations] = await Promise.all([
    prisma.table.findMany({
      where: { isActive: true, seats: { gte: partySize } },
      orderBy: { number: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        status: { in: ["RESERVED", "SEATED"] },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      },
    }),
  ]);

  const slots = buildSlots(dateISO, settings);

  const availability: SlotAvailability[] = slots.map((start) => {
    const end = slotEnd(start, settings.reservationHoldMinutes);
    const availableTableIds = tables
      .filter(
        (t) =>
          !reservations.some(
            (r) => r.tableId === t.id && overlaps(start, end, r.startAt, r.endAt),
          ),
      )
      .map((t) => t.id);

    return {
      startISO: start.toISOString(),
      label: start.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      availableTableIds,
    };
  });

  return {
    slots: availability,
    tables: tables.map((t) => ({
      id: t.id,
      number: t.number,
      seats: t.seats,
      shape: t.shape,
      gridRow: t.gridRow,
      gridCol: t.gridCol,
    })),
    settings: {
      gridRows: settings.gridRows,
      gridCols: settings.gridCols,
      showLayoutToCustomers: settings.showLayoutToCustomers,
      reservationHoldMinutes: settings.reservationHoldMinutes,
      bookingLeadMinutes: settings.bookingLeadMinutes,
      advanceRequired: requiresAdvance(settings),
      advanceAmount: Number(settings.advanceBookingAmount),
    },
  };
}

const ReservationSchema = z.object({
  customerName: z.string().min(2, "Please enter your name"),
  // Mandatory for reservations — the restaurant needs a way to reach the guest.
  customerPhone: z
    .string()
    .trim()
    .min(7, "A mobile number is required to reserve a table")
    .max(20, "That mobile number looks too long"),
  partySize: z.coerce.number().int().min(1).max(30),
  startISO: z.string().min(1, "Pick a time"),
  // Optional: when the floor plan is hidden, the server picks the table.
  tableId: z.string().optional(),
});

type ReservationRequest = z.infer<typeof ReservationSchema>;

export type ReservationState = {
  success?: boolean;
  error?: string;
  tableNumber?: number;
  startLabel?: string;
};

/**
 * Validate a booking request and find a concrete free table for it.
 * Shared by the direct path and the pay-a-deposit-first path.
 */
async function resolveBooking(req: ReservationRequest) {
  const settings = await getSettings();
  const startAt = new Date(req.startISO);
  const endAt = slotEnd(startAt, settings.reservationHoldMinutes);

  // Enforce the lead-time rule server-side too, not just in the UI.
  const earliest = new Date(Date.now() + settings.bookingLeadMinutes * 60000);
  if (startAt < earliest) {
    return {
      error: `Bookings need at least ${settings.bookingLeadMinutes} minutes' notice. Please pick a later slot.`,
    } as const;
  }

  const candidates = await prisma.table.findMany({
    where: {
      isActive: true,
      seats: { gte: req.partySize },
      ...(req.tableId ? { id: req.tableId } : {}),
    },
    orderBy: [{ seats: "asc" }, { number: "asc" }],
  });

  if (candidates.length === 0) {
    return { error: "No table of that size is available. Try a smaller party." } as const;
  }

  const clashing = await prisma.reservation.findMany({
    where: {
      status: { in: ["RESERVED", "SEATED"] },
      tableId: { in: candidates.map((t) => t.id) },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  const free = candidates.find((t) => !clashing.some((r) => r.tableId === t.id));
  if (!free) {
    return {
      error: req.tableId
        ? "That table was just taken for this slot — please pick another."
        : "All tables are booked for that time. Try a different slot.",
    } as const;
  }

  return { table: free, startAt, endAt, settings } as const;
}

function bookedResult(tableNumber: number, startAt: Date): ReservationState {
  return {
    success: true,
    tableNumber,
    startLabel: startAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

export async function createReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const parsed = ReservationSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    partySize: formData.get("partySize"),
    startISO: formData.get("startISO"),
    tableId: formData.get("tableId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const resolved = await resolveBooking(parsed.data);
  if ("error" in resolved) return { error: resolved.error };

  // If a deposit is required, the reservation is only created after payment.
  if (requiresAdvance(resolved.settings)) {
    return {
      error: "This booking needs an advance payment — please use the payment button.",
    };
  }

  await prisma.reservation.create({
    data: {
      tableId: resolved.table.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      partySize: parsed.data.partySize,
      startAt: resolved.startAt,
      endAt: resolved.endAt,
    },
  });

  revalidateReservationPaths();
  return bookedResult(resolved.table.number, resolved.startAt);
}

function requiresAdvance(settings: {
  advanceBookingEnabled: boolean;
  paymentGatewayEnabled: boolean;
  advanceBookingAmount: Prisma.Decimal;
}) {
  return (
    settings.advanceBookingEnabled &&
    settings.paymentGatewayEnabled &&
    isRazorpayConfigured() &&
    Number(settings.advanceBookingAmount) > 0
  );
}

/**
 * Step 1 of a deposit booking: check the slot is genuinely free, then open a
 * Razorpay order. Nothing is reserved yet, so an abandoned checkout never leaves
 * a table blocked.
 */
export async function startAdvanceBooking(input: ReservationRequest) {
  const parsed = ReservationSchema.parse(input);
  const resolved = await resolveBooking(parsed);
  if ("error" in resolved) throw new Error(resolved.error);

  if (!requiresAdvance(resolved.settings)) {
    throw new Error("Advance payment isn't enabled.");
  }

  const amount = Number(resolved.settings.advanceBookingAmount);
  const order = await getRazorpay().orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `adv-${Date.now()}`,
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    advanceAmount: amount,
  };
}

/** Step 2: verify the signature, re-check availability, then hold the table. */
export async function confirmAdvanceBooking(
  input: ReservationRequest,
  payment: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<ReservationState> {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return { error: "Payments aren't configured — please call us to book." };
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${payment.razorpayOrderId}|${payment.razorpayPaymentId}`)
    .digest("hex");

  if (expected !== payment.razorpaySignature) {
    return { error: "We couldn't verify that payment. Please contact us." };
  }

  const parsed = ReservationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid form" };

  const resolved = await resolveBooking(parsed.data);
  if ("error" in resolved) {
    // Payment went through but the slot vanished — surface it clearly so staff
    // can refund rather than silently losing the booking.
    return {
      error: `${resolved.error} Your payment was received — please contact us for a refund or another slot.`,
    };
  }

  await prisma.reservation.create({
    data: {
      tableId: resolved.table.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      partySize: parsed.data.partySize,
      startAt: resolved.startAt,
      endAt: resolved.endAt,
      advanceAmount: resolved.settings.advanceBookingAmount,
      advancePaymentStatus: "PAID",
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
    },
  });

  revalidateReservationPaths();
  return bookedResult(resolved.table.number, resolved.startAt);
}

export async function seatReservation(id: string) {
  await requireStaff();

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return;

  await prisma.$transaction([
    prisma.reservation.update({ where: { id }, data: { status: "SEATED" } }),
    prisma.diningSession.create({
      data: {
        tableId: reservation.tableId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        reservationId: reservation.id,
        channel: "MANUAL",
      },
    }),
  ]);

  revalidateReservationPaths();
}

export async function cancelReservation(id: string) {
  await requireStaff();
  await prisma.reservation.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidateReservationPaths();
}

export async function markNoShow(id: string) {
  await requireStaff();
  await prisma.reservation.update({ where: { id }, data: { status: "NO_SHOW" } });
  revalidateReservationPaths();
}
