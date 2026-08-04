import Link from "next/link";
import { QrCode } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { OrderFlow } from "@/components/OrderFlow";
import { prisma } from "@/lib/prisma";
import { readGuest } from "@/lib/guest";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const [menuItems, tables, guest] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.table.findMany({ where: { isActive: true }, orderBy: { number: "asc" } }),
    readGuest(),
  ]);

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-16">
        <Blobs />
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Order at your table
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              Place an <span className="gradient-text">Order</span>
            </h1>
            <p className="mx-auto mt-3 flex max-w-md items-center justify-center gap-1.5 text-sm text-ink-dim">
              <QrCode size={14} className="text-pink" />
              Sitting down already? Scan the QR on your table to skip this step.
            </p>
          </Reveal>

          <div className="mt-10">
            <OrderFlow
              menuItems={menuItems.map((m) => ({ ...m, price: m.price.toString() }))}
              tables={tables.map((t) => ({ id: t.id, number: t.number, seats: t.seats }))}
              knownName={guest?.name}
            />
          </div>

          <p className="mt-8 text-center text-xs text-ink-dim">
            Already ordered?{" "}
            <Link href="/orders" className="font-semibold text-pink hover:underline">
              Find it under My Orders
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
