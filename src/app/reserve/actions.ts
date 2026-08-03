"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const ReservationSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  partySize: z.coerce.number().int().min(1).max(20),
  date: z.string().min(1, "Pick a date"),
  timeSlot: z.string().min(1, "Pick a time"),
  notes: z.string().optional(),
});

export type ReservationState = {
  success?: boolean;
  error?: string;
};

export async function createReservation(
  _prevState: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const parsed = ReservationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    partySize: formData.get("partySize"),
    date: formData.get("date"),
    timeSlot: formData.get("timeSlot"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const session = await auth();

  await prisma.reservation.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      partySize: parsed.data.partySize,
      date: new Date(parsed.data.date),
      timeSlot: parsed.data.timeSlot,
      notes: parsed.data.notes,
      userId: session?.user?.id,
    },
  });

  return { success: true };
}
