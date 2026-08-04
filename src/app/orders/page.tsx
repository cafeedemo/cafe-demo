import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { OrdersLookup } from "./OrdersLookup";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Your history
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              My <span className="gradient-text">Orders</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              Enter the mobile number you ordered with.
            </p>
          </Reveal>

          <div className="mt-12">
            <OrdersLookup initialPhone={phone} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
