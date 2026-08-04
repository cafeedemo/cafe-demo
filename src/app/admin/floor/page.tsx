import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { computeTableStatus } from "@/lib/table-status";
import { FloorView } from "@/components/admin/FloorView";

export default async function FloorPage() {
  const now = new Date();

  const [settings, tables, sessions, reservations] = await Promise.all([
    prisma.siteContent.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } }),
    prisma.table.findMany({ where: { isActive: true }, orderBy: { number: "asc" } }),
    prisma.diningSession.findMany({
      where: { status: { in: ["OPEN", "BILLED"] } },
      include: { orders: { include: { items: true } } },
    }),
    prisma.reservation.findMany({
      where: { status: { in: ["RESERVED", "SEATED"] }, endAt: { gt: now } },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const gridTables = tables.map((t) => {
    const session = sessions.find((s) => s.tableId === t.id) ?? null;
    const reservation = reservations.find((r) => r.tableId === t.id) ?? null;
    return {
      id: t.id,
      number: t.number,
      seats: t.seats,
      shape: t.shape,
      gridRow: t.gridRow,
      gridCol: t.gridCol,
      status: computeTableStatus(reservation, Boolean(session), now),
    };
  });

  const openSessions = sessions.map((s) => {
    const live = s.orders.filter((o) => o.status !== "CANCELLED");
    return {
      id: s.id,
      tableId: s.tableId,
      tableNumber: tables.find((t) => t.id === s.tableId)?.number ?? 0,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      isAnonymous: s.isAnonymous,
      status: s.status,
      paymentMode: s.paymentMode,
      openedAt: s.openedAt.toISOString(),
      orderCount: live.length,
      total: live.reduce(
        (sum, o) => sum + o.items.reduce((t, i) => t + Number(i.price) * i.qty, 0),
        0,
      ),
    };
  });

  return (
    <div>
      <PageHeader
        title="Live Floor"
        description="Who's seated, what they owe, and which tables are free right now."
      />
      <FloorView
        gridRows={settings.gridRows}
        gridCols={settings.gridCols}
        tables={gridTables}
        sessions={openSessions}
      />
    </div>
  );
}
