"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

function revalidateTables() {
  revalidatePath("/admin/setup");
  revalidatePath("/admin/floor");
  revalidatePath("/book");
  revalidatePath("/order");
}

const PlaceTableSchema = z.object({
  gridRow: z.coerce.number().int().min(1).max(12),
  gridCol: z.coerce.number().int().min(1).max(12),
  seats: z.coerce.number().int().min(1).max(30),
  shape: z.enum(["SQUARE", "ROUND"]),
});

/** Drop a table onto a grid cell. Table numbers auto-increment. */
export async function placeTable(input: {
  gridRow: number;
  gridCol: number;
  seats: number;
  shape: "SQUARE" | "ROUND";
}) {
  await requireStaff();
  const parsed = PlaceTableSchema.parse(input);

  const occupied = await prisma.table.findFirst({
    where: { gridRow: parsed.gridRow, gridCol: parsed.gridCol },
  });
  if (occupied) throw new Error("There's already a table in that spot");

  const highest = await prisma.table.findFirst({ orderBy: { number: "desc" } });

  await prisma.table.create({
    data: { ...parsed, number: (highest?.number ?? 0) + 1 },
  });

  revalidateTables();
}

export async function updateTable(
  id: string,
  input: { seats?: number; shape?: "SQUARE" | "ROUND"; isActive?: boolean },
) {
  await requireStaff();
  await prisma.table.update({ where: { id }, data: input });
  revalidateTables();
}

export async function removeTable(id: string) {
  await requireStaff();

  const openSession = await prisma.diningSession.findFirst({
    where: { tableId: id, status: { in: ["OPEN", "BILLED"] } },
  });
  if (openSession) {
    throw new Error("That table has an open bill — settle it before removing the table.");
  }

  await prisma.table.delete({ where: { id } });
  revalidateTables();
}
