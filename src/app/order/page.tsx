import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { OrderForm } from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const { table } = await searchParams;

  const [menuItems, tables] = await Promise.all([
    prisma.menuItem.findMany({ where: { isAvailable: true }, orderBy: { name: "asc" } }),
    prisma.table.findMany({ orderBy: { label: "asc" } }),
  ]);

  const serializedMenu = menuItems.map((m) => ({ ...m, price: m.price.toString() }));

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Hungry?
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              Place an <span className="gradient-text">Order</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              Just your name and mobile number — no account needed.
            </p>
          </Reveal>

          <div className="glass-card glow-pink mt-12 rounded-3xl p-8">
            <OrderForm menuItems={serializedMenu} tables={tables} defaultTableId={table} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
