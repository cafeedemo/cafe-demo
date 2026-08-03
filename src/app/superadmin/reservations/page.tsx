import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { ReservationsTable } from "@/components/admin/ReservationsTable";

export default async function SuperadminReservationsPage() {
  const reservations = await prisma.reservation.findMany({ orderBy: { date: "asc" } });

  const serialized = reservations.map((r) => ({
    ...r,
    date: r.date.toISOString(),
  }));

  return (
    <div>
      <PageHeader title="Reservations" description="Confirm or cancel incoming table requests." />
      <ReservationsTable reservations={serialized} />
    </div>
  );
}
