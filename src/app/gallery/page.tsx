import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { Reveal } from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { DEMO_IMAGES } from "@/lib/demo-images";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const display =
    images.length > 0
      ? images
      : DEMO_IMAGES.gallery.map((url, i) => ({
          id: `demo-${i}`,
          imageUrl: url,
          caption: null as string | null,
        }));

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              A closer look
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              The <span className="gradient-text">Gallery</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-ink-dim">
              A peek into our space, our drinks, and our regulars.
            </p>
          </Reveal>

          <div className="mt-12 columns-2 gap-4 md:columns-3">
            {display.map((img, i) => (
              <Reveal key={img.id} delay={(i % 6) * 0.06} className="mb-4 break-inside-avoid">
                <div className="glass-card group overflow-hidden rounded-2xl">
                  <div className="overflow-hidden">
                    <Image
                      src={img.imageUrl}
                      alt={img.caption ?? "Cafe photo"}
                      width={600}
                      height={600}
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {img.caption && (
                    <p className="p-3 text-sm text-ink-dim">{img.caption}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
