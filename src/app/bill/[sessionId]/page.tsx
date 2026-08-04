import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { prisma } from "@/lib/prisma";
import { BillView } from "./BillView";

export const dynamic = "force-dynamic";

export default async function BillPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [session, content] = await Promise.all([
    prisma.diningSession.findUnique({
      where: { id: sessionId },
      include: {
        table: true,
        orders: { include: { items: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.siteContent.findUnique({ where: { id: "main" } }),
  ]);

  if (!session) notFound();

  const liveOrders = session.orders.filter((o) => o.status !== "CANCELLED");
  const total = liveOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + Number(i.price) * i.qty, 0),
    0,
  );

  return (
    <>
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center px-6 py-16">
        <Blobs />
        <div className="w-full max-w-lg">
          <BillView
            sessionId={session.id}
            tableNumber={session.table.number}
            customerName={session.customerName}
            status={session.status}
            paymentStatus={session.paymentStatus}
            paymentGatewayEnabled={content?.paymentGatewayEnabled ?? false}
            total={total}
            orders={liveOrders.map((o) => ({
              id: o.id,
              status: o.status,
              createdAt: o.createdAt.toISOString(),
              placedBy: o.placedBy,
              note: o.note,
              items: o.items.map((i) => ({
                name: i.name,
                qty: i.qty,
                price: i.price.toString(),
                notes: i.notes,
              })),
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
