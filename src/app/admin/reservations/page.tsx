import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { ReservationsBoard } from "@/components/admin/ReservationsBoard";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  // Show today's service: anything from 12 hours ago onwards.
  const since = new Date();
  since.setHours(since.getHours() - 12);

  const reservations = await prisma.reservation.findMany({
    include: { table: true },
    orderBy: { startAt: "asc" },
    where: { startAt: { gte: since } },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Upcoming bookings — seat guests when they arrive to open their tab."
      />
      <ReservationsBoard
        reservations={reservations.map((r) => ({
          id: r.id,
          tableNumber: r.table.number,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          partySize: r.partySize,
          startAt: r.startAt.toISOString(),
          endAt: r.endAt.toISOString(),
          status: r.status,
          advanceAmount: r.advanceAmount ? Number(r.advanceAmount) : null,
          advancePaid: r.advancePaymentStatus === "PAID",
        }))}
      />
    </div>
  );
}
