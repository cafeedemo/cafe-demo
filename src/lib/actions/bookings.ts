"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

function revalidateBookingPaths() {
  revalidatePath("/book");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/orders");
}

const BookingSchema = z.object({
  tableId: z.string().min(1),
  customerName: z.string().min(2, "Name is too short"),
  customerPhone: z.string().min(7, "Enter a valid phone number"),
  partySize: z.coerce.number().int().min(1).max(20),
  bookedFor: z.string().min(1),
});

export type BookingState = { success?: boolean; error?: string };

export async function createBooking(
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const parsed = BookingSchema.safeParse({
    tableId: formData.get("tableId"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    partySize: formData.get("partySize"),
    bookedFor: formData.get("bookedFor"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const existing = await prisma.booking.findFirst({
    where: { tableId: parsed.data.tableId, status: { in: ["BOOKED", "SEATED"] } },
  });
  if (existing) {
    return { error: "This table was just booked by someone else — pick another." };
  }

  await prisma.booking.create({
    data: {
      ...parsed.data,
      bookedFor: new Date(parsed.data.bookedFor),
    },
  });

  revalidateBookingPaths();
  return { success: true };
}

export async function startSeating(id: string) {
  await requireStaff();
  await prisma.booking.update({
    where: { id },
    data: { status: "SEATED", seatedAt: new Date() },
  });
  revalidateBookingPaths();
}

export async function markBookingDone(id: string) {
  await requireStaff();
  await prisma.booking.update({
    where: { id },
    data: { status: "DONE", doneAt: new Date() },
  });
  revalidateBookingPaths();
}

export async function cancelBooking(id: string) {
  await requireStaff();
  await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidateBookingPaths();
}
