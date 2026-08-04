"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";
import {
  buildSlots,
  overlaps,
  slotEnd,
  generateAnonymousPhone,
} from "@/lib/booking-slots";

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
    },
  };
}

const ReservationSchema = z.object({
  customerName: z.string().min(2, "Please enter your name"),
  customerPhone: z.string().optional(),
  partySize: z.coerce.number().int().min(1).max(30),
  startISO: z.string().min(1, "Pick a time"),
  // Optional: when the floor plan is hidden, the server picks the table.
  tableId: z.string().optional(),
});

export type ReservationState = {
  success?: boolean;
  error?: string;
  tableNumber?: number;
  startLabel?: string;
};

export async function createReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const parsed = ReservationSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone") || undefined,
    partySize: formData.get("partySize"),
    startISO: formData.get("startISO"),
    tableId: formData.get("tableId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const settings = await getSettings();
  const startAt = new Date(parsed.data.startISO);
  const endAt = slotEnd(startAt, settings.reservationHoldMinutes);

  // Enforce the lead-time rule server-side too, not just in the UI.
  const earliest = new Date(Date.now() + settings.bookingLeadMinutes * 60000);
  if (startAt < earliest) {
    return {
      error: `Bookings need at least ${settings.bookingLeadMinutes} minutes' notice. Please pick a later slot.`,
    };
  }

  const candidates = await prisma.table.findMany({
    where: {
      isActive: true,
      seats: { gte: parsed.data.partySize },
      ...(parsed.data.tableId ? { id: parsed.data.tableId } : {}),
    },
    orderBy: [{ seats: "asc" }, { number: "asc" }],
  });

  if (candidates.length === 0) {
    return { error: "No table of that size is available. Try a smaller party." };
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
      error: parsed.data.tableId
        ? "That table was just taken for this slot — please pick another."
        : "All tables are booked for that time. Try a different slot.",
    };
  }

  const phone = parsed.data.customerPhone?.trim() || generateAnonymousPhone();

  await prisma.reservation.create({
    data: {
      tableId: free.id,
      customerName: parsed.data.customerName,
      customerPhone: phone,
      partySize: parsed.data.partySize,
      startAt,
      endAt,
    },
  });

  revalidateReservationPaths();

  return {
    success: true,
    tableNumber: free.number,
    startLabel: startAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
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
