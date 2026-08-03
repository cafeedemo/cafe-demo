import Image from "next/image";
import { Camera } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="relative flex-1 px-6 py-20">
        <Blobs />
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-pink">
              Vibes only
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              The <span className="gradient-text">Gallery</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-ink-dim">
              A peek into our space, our drinks, and our regulars.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="glass-card mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-3xl p-10 text-center">
              <Camera className="text-ink-dim" size={32} />
              <p className="text-ink-dim">
                No photos yet — check back soon or follow us on Instagram!
              </p>
            </div>
          ) : (
            <div className="mt-12 columns-2 gap-4 md:columns-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="glass-card mb-4 break-inside-avoid overflow-hidden rounded-2xl"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.caption ?? "Cafe photo"}
                    width={600}
                    height={600}
                    className="h-auto w-full object-cover"
                  />
                  {img.caption && (
                    <p className="p-3 text-sm text-ink-dim">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
