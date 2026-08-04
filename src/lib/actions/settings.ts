"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/guard";

function revalidateSettings() {
  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/order");
  revalidatePath("/admin/setup");
}

const BrandingSchema = z.object({
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

export async function updateBranding(formData: FormData) {
  await requireStaff();

  const parsed = BrandingSchema.parse({
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

  revalidateSettings();
}

const RulesSchema = z.object({
  reservationHoldMinutes: z.coerce.number().int().min(15).max(360),
  bookingLeadMinutes: z.coerce.number().int().min(0).max(1440),
  slotIntervalMinutes: z.coerce.number().int().min(5).max(120),
  serviceOpenHour: z.coerce.number().int().min(0).max(23),
  serviceCloseHour: z.coerce.number().int().min(1).max(24),
  gridRows: z.coerce.number().int().min(1).max(12),
  gridCols: z.coerce.number().int().min(1).max(12),
});

export async function updateRules(formData: FormData) {
  await requireStaff();

  const parsed = RulesSchema.parse({
    reservationHoldMinutes: formData.get("reservationHoldMinutes"),
    bookingLeadMinutes: formData.get("bookingLeadMinutes"),
    slotIntervalMinutes: formData.get("slotIntervalMinutes"),
    serviceOpenHour: formData.get("serviceOpenHour"),
    serviceCloseHour: formData.get("serviceCloseHour"),
    gridRows: formData.get("gridRows"),
    gridCols: formData.get("gridCols"),
  });

  if (parsed.serviceCloseHour <= parsed.serviceOpenHour) {
    throw new Error("Closing hour must be after opening hour");
  }

  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: parsed,
    create: { id: "main", ...parsed },
  });

  revalidateSettings();
}

export async function toggleFeature(
  feature: "paymentGatewayEnabled" | "showLayoutToCustomers" | "advanceBookingEnabled",
  enabled: boolean,
) {
  await requireStaff();
  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: { [feature]: enabled },
    create: { id: "main", [feature]: enabled },
  });
  revalidateSettings();
}

export async function updateAdvanceAmount(amount: number) {
  await requireStaff();
  const parsed = z.coerce.number().min(0).max(100000).parse(amount);
  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: { advanceBookingAmount: parsed },
    create: { id: "main", advanceBookingAmount: parsed },
  });
  revalidateSettings();
}
