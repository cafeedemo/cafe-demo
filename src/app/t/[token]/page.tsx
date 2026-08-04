import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { OrderFlow } from "@/components/OrderFlow";
import { prisma } from "@/lib/prisma";
import { readGuest } from "@/lib/guest";

export const dynamic = "force-dynamic";

/** Landing page for the QR code fixed to each table. */
export default async function ScanOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const table = await prisma.table.findUnique({ where: { qrToken: token } });
  if (!table || !table.isActive) notFound();

  const [menuItems, content, guest] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.siteContent.findUnique({ where: { id: "main" } }),
    readGuest(),
  ]);

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-16">
        <Blobs />
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              {content?.cafeName ?? "Welcome"}
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              Table <span className="gradient-text">{table.number}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              You&apos;re all set — tell us who you are and start ordering.
            </p>
          </div>

          <div className="mt-10">
            <OrderFlow
              menuItems={menuItems.map((m) => ({ ...m, price: m.price.toString() }))}
              tables={[{ id: table.id, number: table.number, seats: table.seats }]}
              scannedTable={{ id: table.id, number: table.number, seats: table.seats }}
              knownName={guest?.name}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
