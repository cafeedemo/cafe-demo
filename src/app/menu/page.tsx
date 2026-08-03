import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { MenuGrid } from "./MenuGrid";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const serialized = items.map((item) => ({
    ...item,
    price: item.price.toString(),
  }));

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              What we&apos;re serving
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              The <span className="gradient-text">Menu</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-ink-dim">
              Handcrafted drinks, fresh bites, and specials made for good moods.
            </p>
          </Reveal>

          <MenuGrid items={serialized} />
        </div>
      </main>
      <Footer />
    </>
  );
}
