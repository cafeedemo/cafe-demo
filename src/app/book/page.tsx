import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { toDateISO } from "@/lib/booking-slots";
import { getAvailability } from "@/lib/actions/reservations";
import { BookingView } from "./BookingView";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const today = toDateISO(new Date());
  const initial = await getAvailability(today, 1);

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-16">
        <Blobs />
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Reserve ahead
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              Book a <span className="gradient-text">Table</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              Pick a date and time — we&apos;ll hold your table for{" "}
              {initial.settings.reservationHoldMinutes} minutes.
            </p>
          </Reveal>

          <div className="mt-10">
            <BookingView initialDate={today} initialData={initial} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
