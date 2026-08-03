import Link from "next/link";
import { Sparkles, Coffee, Heart, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Blobs } from "@/components/ui/Blobs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [content, featured, gallery] = await Promise.all([
    prisma.siteContent.findUnique({ where: { id: "main" } }),
    prisma.menuItem.findMany({
      where: { isFeatured: true, isAvailable: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" }, take: 4 }),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-20 pb-28 text-center">
          <Blobs />
          <span className="glass-card mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-ink-dim">
            <Sparkles size={14} className="text-lime" /> Now open · fresh vibes daily
          </span>
          <h1 className="mx-auto max-w-3xl font-heading text-5xl font-bold leading-tight sm:text-7xl">
            <span className="gradient-text">{content?.heroText ?? "Sip. Vibe. Repeat."}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-dim">
            {content?.tagline ??
              "Your daily dose of good vibes — specialty coffee, cozy corners, and playlists that hit different."}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/reserve" variant="primary" className="glow-pink px-8 py-4 text-base">
              Book a Table
            </Button>
            <Button href="/menu" variant="outline" className="px-8 py-4 text-base">
              View Menu
            </Button>
          </div>
        </section>

        {/* Featured items */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="font-heading text-3xl font-bold">
                Crowd <span className="gradient-text">Favorites</span>
              </h2>
              <Link href="/menu" className="text-sm font-semibold text-pink hover:underline">
                Full menu →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="glass-card group rounded-3xl p-6 transition-transform hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-pink/20 via-orange/20 to-purple/20">
                    <Coffee className="text-ink-dim/50" size={48} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                    <span className="whitespace-nowrap font-heading font-bold text-lime">
                      ${item.price.toString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-dim">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-pink">
                Our Story
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
                More than coffee, it&apos;s a <span className="gradient-text">vibe</span>
              </h2>
              <p className="mt-4 text-ink-dim">
                {content?.aboutText ??
                  "A cozy corner for coffee lovers and dreamers — great music, warm light, and drinks worth posting about."}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="glass-card rounded-2xl p-4">
                  <Star className="mx-auto mb-1 text-lime" size={20} />
                  <p className="font-heading text-xl font-bold">4.9</p>
                  <p className="text-xs text-ink-dim">Rating</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <Coffee className="mx-auto mb-1 text-pink" size={20} />
                  <p className="font-heading text-xl font-bold">30+</p>
                  <p className="text-xs text-ink-dim">Drinks</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <Heart className="mx-auto mb-1 text-purple" size={20} />
                  <p className="font-heading text-xl font-bold">10k+</p>
                  <p className="text-xs text-ink-dim">Happy sips</p>
                </div>
              </div>
            </div>
            <div className="glass-card glow-purple aspect-square rounded-3xl bg-gradient-to-br from-purple/20 via-pink/10 to-orange/20" />
          </div>
        </section>

        {/* Gallery preview */}
        {gallery.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="mb-8 font-heading text-3xl font-bold">
              Straight from our <span className="gradient-text">Gram</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="glass-card aspect-square rounded-2xl bg-gradient-to-br from-pink/20 to-purple/20"
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button href="/gallery" variant="outline">
                See full gallery
              </Button>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="glass-card glow-pink rounded-3xl p-12">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Ready to <span className="gradient-text">vibe with us?</span>
            </h2>
            <p className="mt-3 text-ink-dim">
              Grab a table, grab a drink, and let the good times roll.
            </p>
            <Button href="/reserve" variant="primary" className="mt-8 px-8 py-4 text-base">
              Reserve Your Spot
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
