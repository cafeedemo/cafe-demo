"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

function revalidateReservationPaths() {
  revalidatePath("/admin/reservations");
  revalidatePath("/superadmin/reservations");
}

export async function updateReservationStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
) {
  await requireStaff();
  await prisma.reservation.update({ where: { id }, data: { status } });
  revalidateReservationPaths();
}
