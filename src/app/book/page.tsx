import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { computeTableStatus } from "@/lib/table-status";
import { BookingView } from "./BookingView";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const tables = await prisma.table.findMany({ orderBy: { createdAt: "asc" } });
  const activeBookings = await prisma.booking.findMany({
    where: { status: { in: ["BOOKED", "SEATED"] } },
  });

  const layoutTables = tables.map((t) => {
    const booking = activeBookings.find((b) => b.tableId === t.id) ?? null;
    return {
      id: t.id,
      label: t.label,
      seats: t.seats,
      shape: t.shape,
      x: t.x,
      y: t.y,
      status: computeTableStatus(booking),
    };
  });

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Pick your spot
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              Book a <span className="gradient-text">Table</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              Tap an available table below to reserve it — no account needed.
            </p>
          </Reveal>

          <div className="mt-12">
            <BookingView tables={layoutTables} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
