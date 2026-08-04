import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { OrdersManager } from "@/components/admin/OrdersManager";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true, table: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    tableId: o.tableId,
    tableLabel: o.table?.label ?? null,
    total: o.total.toString(),
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price.toString() })),
  }));

  return (
    <div>
      <PageHeader title="Orders" description="Track and update every order — dine-in or takeaway." />
      <OrdersManager orders={serialized} />
    </div>
  );
}
