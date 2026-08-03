import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { ReservationForm } from "./ReservationForm";

export default function ReservePage() {
  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Save your seat
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              Book a <span className="gradient-text">Table</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-ink-dim">
              Tell us when you&apos;re coming through, we&apos;ll have a spot ready.
            </p>
          </div>

          <div className="glass-card glow-pink mt-12 rounded-3xl p-8">
            <ReservationForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
