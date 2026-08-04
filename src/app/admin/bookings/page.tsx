import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { BookingsManager } from "@/components/admin/BookingsManager";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    where: { status: { in: ["BOOKED", "SEATED"] } },
    include: { table: true },
    orderBy: { bookedFor: "asc" },
  });

  const serialized = bookings.map((b) => ({
    id: b.id,
    tableId: b.tableId,
    tableLabel: b.table.label,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    partySize: b.partySize,
    bookedFor: b.bookedFor.toISOString(),
    status: b.status,
    seatedAt: b.seatedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <PageHeader title="Bookings" description="Seat guests, track table timers, and settle bills." />
      <BookingsManager bookings={serialized} />
    </div>
  );
}
