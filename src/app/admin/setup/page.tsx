import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { SetupCafe } from "@/components/admin/SetupCafe";

export default async function SetupPage() {
  const [settings, tables, mediaAssets] = await Promise.all([
    prisma.siteContent.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } }),
    prisma.table.findMany({ orderBy: { number: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Setup Cafe"
        description="Your branding, floor plan, and the rules that drive bookings and payments."
      />
      <SetupCafe
        settings={{
          cafeName: settings.cafeName,
          tagline: settings.tagline,
          heroText: settings.heroText,
          aboutText: settings.aboutText,
          address: settings.address,
          phone: settings.phone,
          instagram: settings.instagram,
          openingHours: settings.openingHours,
          mapEmbedUrl: settings.mapEmbedUrl,
          logoUrl: settings.logoUrl,
          reservationHoldMinutes: settings.reservationHoldMinutes,
          bookingLeadMinutes: settings.bookingLeadMinutes,
          slotIntervalMinutes: settings.slotIntervalMinutes,
          serviceOpenHour: settings.serviceOpenHour,
          serviceCloseHour: settings.serviceCloseHour,
          gridRows: settings.gridRows,
          gridCols: settings.gridCols,
          showLayoutToCustomers: settings.showLayoutToCustomers,
          paymentGatewayEnabled: settings.paymentGatewayEnabled,
          advanceBookingEnabled: settings.advanceBookingEnabled,
          advanceBookingAmount: Number(settings.advanceBookingAmount),
        }}
        tables={tables.map((t) => ({
          id: t.id,
          number: t.number,
          seats: t.seats,
          shape: t.shape,
          gridRow: t.gridRow,
          gridCol: t.gridCol,
          qrToken: t.qrToken,
          isActive: t.isActive,
        }))}
        mediaAssets={mediaAssets}
      />
    </div>
  );
}
