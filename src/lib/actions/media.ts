"use server";

import { z } from "zod";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

const CATEGORIES = ["DISH", "AMBIENCE", "HERO", "ABOUT", "GALLERY", "LOGO", "OTHER"] as const;

function revalidateMediaPaths() {
  revalidatePath("/admin/media");
  revalidatePath("/menu");
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function uploadMediaAsset(formData: FormData) {
  await requireStaff();

  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "OTHER";
  const label = (formData.get("label") as string) || undefined;

  if (!file || file.size === 0) throw new Error("No file selected");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Photo uploads aren't set up yet — add BLOB_READ_WRITE_TOKEN in Vercel. You can still use photos already in the library.",
    );
  }

  const blob = await put(`media/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  await prisma.mediaAsset.create({
    data: {
      url: blob.url,
      source: "BLOB",
      category: category as (typeof CATEGORIES)[number],
      label,
    },
  });

  revalidateMediaPaths();
}

const RegisterSchema = z.object({
  url: z.string().min(1),
  category: z.enum(CATEGORIES),
  label: z.string().optional(),
});

export async function registerGitAsset(formData: FormData) {
  await requireStaff();

  const parsed = RegisterSchema.parse({
    url: formData.get("url"),
    category: formData.get("category"),
    label: formData.get("label") || undefined,
  });

  await prisma.mediaAsset.create({
    data: { ...parsed, source: "GIT" },
  });

  revalidateMediaPaths();
}

export async function deleteMediaAsset(id: string) {
  await requireStaff();

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;

  if (asset.source === "BLOB") {
    await del(asset.url).catch(() => {});
  }

  await prisma.mediaAsset.delete({ where: { id } });
  revalidateMediaPaths();
}
