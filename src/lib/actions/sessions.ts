"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";
import { readGuest, rememberGuest } from "@/lib/guest";

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
  channel: z.enum(["QR", "MANUAL", "WAITER"]).default("MANUAL"),
});

/**
 * Open a dining session, or join the one already open at that table.
 *
 * Ordering asks for a name only — no phone, no sign-up. Choosing a table (by
 * scanning its QR or picking the number) *is* the sign-in: we mint a cookie so
 * the guest is remembered on their next order and under My Orders.
 *
 * Case 1 — walk-in: no reservation exists, we just open a session.
 * Case 2 — reserved: a RESERVED booking for this table is picked up and marked
 *          SEATED, and its phone number carries onto the session.
 */
export async function startOrJoinSession(input: {
  tableId: string;
  customerName: string;
  channel?: "QR" | "MANUAL" | "WAITER";
}) {
  const parsed = StartSessionSchema.parse(input);

  const guestKey = await rememberGuest(parsed.customerName);

  // Someone already has this table open — join their tab rather than starting a
  // second one, and claim it for this browser so they can see the bill.
  const existing = await prisma.diningSession.findFirst({
    where: { tableId: parsed.tableId, status: { in: ["OPEN", "BILLED"] } },
  });
  if (existing) {
    if (!existing.guestKey) {
      await prisma.diningSession.update({
        where: { id: existing.id },
        data: { guestKey },
      });
    }
    return existing.id;
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      tableId: parsed.tableId,
      status: "RESERVED",
      endAt: { gt: new Date() },
    },
    orderBy: { startAt: "asc" },
  });

  const session = await prisma.diningSession.create({
    data: {
      tableId: parsed.tableId,
      customerName: parsed.customerName,
      // Only a reservation supplies a phone number; walk-ins have none.
      customerPhone: reservation?.customerPhone ?? null,
      guestKey,
      isAnonymous: !reservation,
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

type SessionWhere =
  | { guestKey: string }
  | { customerPhone: string }
  | { OR: ({ guestKey: string } | { customerPhone: string })[] };

async function findSessions(where: SessionWhere) {
  const sessions = await prisma.diningSession.findMany({
    where,
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

export type GuestSession = Awaited<ReturnType<typeof findSessions>>[number];

/**
 * "My Orders" with nothing to fill in: we match on the browser's guest cookie,
 * and also on the phone from any reservation they made, so a booking placed on
 * one device still shows up alongside the orders they placed at the table.
 */
export async function getMySessions(): Promise<GuestSession[]> {
  const guest = await readGuest();
  if (!guest) return [];

  const reservations = await prisma.diningSession.findMany({
    where: { guestKey: guest.guestKey, customerPhone: { not: null } },
    select: { customerPhone: true },
    distinct: ["customerPhone"],
  });

  const phones = reservations
    .map((r) => r.customerPhone)
    .filter((p): p is string => Boolean(p));

  if (phones.length === 0) return findSessions({ guestKey: guest.guestKey });

  return findSessions({
    OR: [{ guestKey: guest.guestKey }, ...phones.map((p) => ({ customerPhone: p }))],
  });
}

/** Fallback lookup for guests who booked on another device. */
export async function lookupSessionsByPhone(phone: string): Promise<GuestSession[]> {
  if (!phone.trim()) return [];
  return findSessions({ customerPhone: phone.trim() });
}
