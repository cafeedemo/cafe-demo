"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

function revalidateTablePaths() {
  revalidatePath("/admin/tables");
  revalidatePath("/book");
}

const TableSchema = z.object({
  label: z.string().min(1),
  seats: z.coerce.number().int().min(1).max(20),
  shape: z.enum(["square", "round"]).default("square"),
});

export async function createTable(formData: FormData) {
  await requireStaff();
  const parsed = TableSchema.parse({
    label: formData.get("label"),
    seats: formData.get("seats"),
    shape: formData.get("shape") || "square",
  });

  const count = await prisma.table.count();
  await prisma.table.create({
    data: { ...parsed, x: 10 + ((count * 20) % 80), y: 10 + Math.floor((count * 20) / 80) * 25 },
  });
  revalidateTablePaths();
}

export async function updateTablePosition(id: string, x: number, y: number) {
  await requireStaff();
  await prisma.table.update({
    where: { id },
    data: { x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)) },
  });
  revalidateTablePaths();
}

export async function deleteTable(id: string) {
  await requireStaff();
  await prisma.table.delete({ where: { id } });
  revalidateTablePaths();
}
