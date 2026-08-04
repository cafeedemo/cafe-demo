import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { prisma } from "@/lib/prisma";
import { PayView } from "./PayView";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;

  const [table, orders, content] = await Promise.all([
    prisma.table.findUnique({ where: { id: tableId } }),
    prisma.order.findMany({
      where: { tableId, paymentStatus: "PENDING" },
      include: { items: true },
    }),
    prisma.siteContent.findUnique({ where: { id: "main" } }),
  ]);

  if (!table) notFound();

  const total = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <>
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center px-6 py-20">
        <Blobs />
        <div className="glass-card glow-pink w-full max-w-md rounded-3xl p-8">
          <PayView
            tableLabel={table.label}
            tableId={table.id}
            orders={orders.map((o) => ({
              id: o.id,
              total: o.total.toString(),
              items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price.toString() })),
            }))}
            total={total}
            paymentGatewayEnabled={content?.paymentGatewayEnabled ?? false}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
