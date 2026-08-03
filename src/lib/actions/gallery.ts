"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

const GallerySchema = z.object({
  imageUrl: z.url("Enter a valid image URL"),
  caption: z.string().optional(),
  placement: z.enum(["GALLERY", "HERO", "ABOUT"]).default("GALLERY"),
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
    placement: formData.get("placement") || undefined,
  });

  await prisma.galleryImage.create({ data: parsed });
  revalidateGalleryPaths();
}

export async function updateGalleryPlacement(id: string, placement: "GALLERY" | "HERO" | "ABOUT") {
  await requireStaff();
  await prisma.galleryImage.update({ where: { id }, data: { placement } });
  revalidateGalleryPaths();
}

export async function deleteGalleryImage(id: string) {
  await requireStaff();
  await prisma.galleryImage.delete({ where: { id } });
  revalidateGalleryPaths();
}
