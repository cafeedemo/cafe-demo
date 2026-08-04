"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

const MenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.enum(["COFFEE", "TEA", "PASTRY", "FOOD", "SPECIALS"]),
  imageUrl: z.string().optional(),
  isAvailable: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

function revalidateMenuPaths() {
  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function createMenuItem(formData: FormData) {
  await requireStaff();

  const parsed = MenuItemSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  await prisma.menuItem.create({ data: parsed });
  revalidateMenuPaths();
}

export async function updateMenuItem(id: string, formData: FormData) {
  await requireStaff();

  const parsed = MenuItemSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  await prisma.menuItem.update({ where: { id }, data: parsed });
  revalidateMenuPaths();
}

export async function deleteMenuItem(id: string) {
  await requireStaff();
  await prisma.menuItem.delete({ where: { id } });
  revalidateMenuPaths();
}
