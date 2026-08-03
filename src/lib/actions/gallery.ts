"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

const GallerySchema = z.object({
  imageUrl: z.url("Enter a valid image URL"),
  caption: z.string().optional(),
});

function revalidateGalleryPaths() {
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  revalidatePath("/superadmin/gallery");
}

export async function createGalleryImage(formData: FormData) {
  await requireStaff();

  const parsed = GallerySchema.parse({
    imageUrl: formData.get("imageUrl"),
    caption: formData.get("caption") || undefined,
  });

  await prisma.galleryImage.create({ data: parsed });
  revalidateGalleryPaths();
}

export async function deleteGalleryImage(id: string) {
  await requireStaff();
  await prisma.galleryImage.delete({ where: { id } });
  revalidateGalleryPaths();
}
