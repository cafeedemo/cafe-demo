"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";
import { generateAnonymousPhone } from "@/lib/booking-slots";

function revalidateAll() {
  revalidatePath("/admin/floor");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
  revalidatePath("/orders");
}

const StartSessionSchema = z.object({
  tableId: z.string().min(1, "Pick a table"),
  customerName: z.string().min(2, "Please enter your name"),
  customerPhone: z.string().optional(),
  channel: z.enum(["QR", "MANUAL", "WAITER"]).default("MANUAL"),
});

/**
 * Open a dining session, or reuse the one already open at that table.
 *
 * Case 1 — walk-in: no reservation exists, we just open a session.
 * Case 2 — reserved: a RESERVED booking for this table is picked up and marked
 *          SEATED so the floor view and the bill stay linked to it.
 */
export async function startOrJoinSession(input: {
  tableId: string;
  customerName: string;
  customerPhone?: string;
  channel?: "QR" | "MANUAL" | "WAITER";
}) {
  const parsed = StartSessionSchema.parse(input);

  const existing = await prisma.diningSession.findFirst({
    where: { tableId: parsed.tableId, status: "OPEN" },
  });
  if (existing) return existing.id;

  const now = new Date();
  const reservation = await prisma.reservation.findFirst({
    where: {
      tableId: parsed.tableId,
      status: "RESERVED",
      endAt: { gt: now },
    },
    orderBy: { startAt: "asc" },
  });

  const phone = parsed.customerPhone?.trim() || generateAnonymousPhone();

  const session = await prisma.diningSession.create({
    data: {
      tableId: parsed.tableId,
      customerName: parsed.customerName,
      customerPhone: phone,
      isAnonymous: !parsed.customerPhone?.trim(),
      channel: parsed.channel,
      reservationId: reservation?.id,
    },
  });

  if (reservation) {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "SEATED" },
    });
  }

  revalidateAll();
  return session.id;
}

const PlaceOrderSchema = z.object({
  sessionId: z.string().min(1),
  placedBy: z.enum(["CUSTOMER", "WAITER"]).default("CUSTOMER"),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        qty: z.coerce.number().int().min(1).max(50),
        notes: z.string().optional(),
      }),
    )
    .min(1, "Add at least one item"),
});

/** A session can receive many orders — the bill is the sum of them all. */
export async function placeOrder(input: {
  sessionId: string;
  placedBy?: "CUSTOMER" | "WAITER";
  note?: string;
  items: { menuItemId: string; qty: number; notes?: string }[];
}) {
  const parsed = PlaceOrderSchema.parse(input);

  const session = await prisma.diningSession.findUnique({
    where: { id: parsed.sessionId },
  });
  if (!session || session.status !== "OPEN") {
    throw new Error("This table's bill is already closed.");
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: parsed.items.map((i) => i.menuItemId) }, isAvailable: true },
  });

  const lines = parsed.items.map((i) => {
    const menuItem = menuItems.find((m) => m.id === i.menuItemId);
    if (!menuItem) throw new Error("One of those dishes is no longer available.");
    return { menuItem, qty: i.qty, notes: i.notes };
  });

  const order = await prisma.order.create({
    data: {
      sessionId: parsed.sessionId,
      placedBy: parsed.placedBy,
      note: parsed.note,
      items: {
        create: lines.map((l) => ({
          menuItemId: l.menuItem.id,
          name: l.menuItem.name,
          price: l.menuItem.price,
          qty: l.qty,
          notes: l.notes,
        })),
      },
    },
  });

  revalidateAll();
  return order.id;
}

export async function updateOrderStatus(
  id: string,
  status: "PLACED" | "PREPARING" | "SERVED" | "CANCELLED",
) {
  await requireStaff();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidateAll();
}

/** Customers can pull a mistaken order themselves while it's still un-started. */
export async function cancelOwnOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.status !== "PLACED") {
    throw new Error("The kitchen has already started this order — please ask a server.");
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  revalidateAll();
}

export async function setSessionPaymentIntent(sessionId: string, mode: "COUNTER" | "ONLINE") {
  await prisma.diningSession.update({
    where: { id: sessionId },
    data: { paymentMode: mode, status: "BILLED" },
  });
  revalidateAll();
}

/**
 * Collecting payment closes the session and, with it, frees the table:
 * the linked reservation is completed so availability opens back up.
 */
export async function collectPayment(sessionId: string, mode: "COUNTER" | "ONLINE" = "COUNTER") {
  await requireStaff();

  const session = await prisma.diningSession.findUnique({ where: { id: sessionId } });
  if (!session) return;

  await prisma.$transaction(async (tx) => {
    await tx.diningSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        paymentStatus: "PAID",
        paymentMode: session.paymentMode ?? mode,
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

  revalidateAll();
}

export async function sessionTotal(sessionId: string) {
  const orders = await prisma.order.findMany({
    where: { sessionId, status: { not: "CANCELLED" } },
    include: { items: true },
  });
  return orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + Number(i.price) * i.qty, 0),
    0,
  );
}

/** Order history for a customer, keyed on their mobile number. */
export async function lookupSessionsByPhone(phone: string) {
  const sessions = await prisma.diningSession.findMany({
    where: { customerPhone: phone.trim() },
    include: {
      table: true,
      orders: { include: { items: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { openedAt: "desc" },
    take: 30,
  });

  return sessions.map((s) => ({
    id: s.id,
    tableNumber: s.table.number,
    status: s.status,
    paymentStatus: s.paymentStatus,
    openedAt: s.openedAt.toISOString(),
    total: s.orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.items.reduce((t, i) => t + Number(i.price) * i.qty, 0), 0),
    orders: s.orders.map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: i.price.toString(),
        notes: i.notes,
      })),
    })),
  }));
}
