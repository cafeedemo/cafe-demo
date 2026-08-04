"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

const ContentSchema = z.object({
  cafeName: z.string().min(1),
  tagline: z.string().min(1),
  heroText: z.string().min(1),
  aboutText: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  instagram: z.string().optional(),
  openingHours: z.string().min(1),
  mapEmbedUrl: z.string().optional(),
  logoUrl: z.string().optional(),
});

export async function updateSiteContent(formData: FormData) {
  await requireStaff();

  const parsed = ContentSchema.parse({
    cafeName: formData.get("cafeName"),
    tagline: formData.get("tagline"),
    heroText: formData.get("heroText"),
    aboutText: formData.get("aboutText"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    instagram: formData.get("instagram") || undefined,
    openingHours: formData.get("openingHours"),
    mapEmbedUrl: formData.get("mapEmbedUrl") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });

  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: parsed,
    create: { id: "main", ...parsed },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function togglePaymentGateway(enabled: boolean) {
  await requireStaff();
  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: { paymentGatewayEnabled: enabled },
    create: { id: "main", paymentGatewayEnabled: enabled },
  });
  revalidatePath("/admin/content");
  revalidatePath("/pay/[tableId]", "page");
}
