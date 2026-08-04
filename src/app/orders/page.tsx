import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { getMySessions, lookupSessionsByPhone } from "@/lib/actions/sessions";
import { readGuest } from "@/lib/guest";
import { OrdersLookup } from "./OrdersLookup";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const guest = await readGuest();

  // Nothing to fill in: the guest cookie resolves their visits on arrival.
  // ?phone= is only a fallback for someone who booked on another device.
  const sessions = phone ? await lookupSessionsByPhone(phone) : await getMySessions();

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-16">
        <Blobs />
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Your visits
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              {guest?.name ? (
                <>
                  Hi <span className="gradient-text">{guest.name}</span>
                </>
              ) : (
                <>
                  My <span className="gradient-text">Orders</span>
                </>
              )}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              {sessions.length > 0
                ? "Everything you've ordered with us, newest first."
                : "Your orders show up here automatically once you order at a table."}
            </p>
          </Reveal>

          <div className="mt-10">
            <OrdersLookup
              sessions={sessions}
              recognised={Boolean(guest)}
              searchedPhone={phone}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
