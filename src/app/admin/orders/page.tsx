import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { KitchenQueue } from "@/components/admin/KitchenQueue";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      session: { include: { table: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description="The kitchen queue — move tickets along, or cancel one placed by mistake."
      />
      <KitchenQueue
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          placedBy: o.placedBy,
          note: o.note,
          createdAt: o.createdAt.toISOString(),
          tableNumber: o.session.table.number,
          customerName: o.session.customerName,
          sessionId: o.sessionId,
          items: o.items.map((i) => ({
            name: i.name,
            qty: i.qty,
            price: i.price.toString(),
            notes: i.notes,
          })),
        }))}
      />
    </div>
  );
}
