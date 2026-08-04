import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { lookupSessionsByPhone } from "@/lib/actions/sessions";
import { OrdersLookup } from "./OrdersLookup";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;

  // When we arrive with ?phone= (straight after ordering), resolve it here so
  // the list is already rendered rather than fetched again on the client.
  const initialSessions = phone ? await lookupSessionsByPhone(phone) : null;

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
              My <span className="gradient-text">Orders</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              Enter the mobile number you ordered with to see your bills and order IDs.
            </p>
          </Reveal>

          <div className="mt-10">
            <OrdersLookup initialPhone={phone} initialSessions={initialSessions} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
