"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Coffee, Heart, Star, MapPin, Clock, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

type FeaturedItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
};

type GalleryItem = { id: string; imageUrl: string; caption: string | null };

type SiteContentDto = {
  heroText: string;
  tagline: string;
  aboutText: string;
  address: string;
  phone: string;
  openingHours: string;
  mapEmbedUrl: string | null;
} | null;

export function HomeView({
  content,
  featured,
  gallery,
  heroImageUrl,
  aboutImageUrl,
  demoMenuImages,
  demoGalleryImages,
}: {
  content: SiteContentDto;
  featured: FeaturedItem[];
  gallery: GalleryItem[];
  heroImageUrl: string;
  aboutImageUrl: string;
  demoMenuImages: string[];
  demoGalleryImages: string[];
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const galleryImages = gallery.length > 0 ? gallery : demoGalleryImages.map((url, i) => ({ id: `demo-${i}`, imageUrl: url, caption: null }));

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section ref={heroRef} className="relative h-[92vh] min-h-[600px] overflow-hidden">
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt="Cafe interior"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-base/10" />
          </motion.div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-ink-dim"
            >
              <Sparkles size={14} className="text-pink" /> Now open · fresh daily
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mx-auto max-w-3xl font-heading text-5xl font-bold leading-tight sm:text-7xl"
            >
              <span className="gradient-text">{content?.heroText ?? "Sip. Savor. Stay a while."}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg text-ink-dim"
            >
              {content?.tagline ?? "Specialty coffee and a warm, unhurried space to enjoy it in."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button href="/book" variant="primary" className="glow-pink px-8 py-4 text-base">
                Book a Table
              </Button>
              <Button href="/menu" variant="outline" className="px-8 py-4 text-base">
                View Menu
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Featured items */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mb-10 flex items-center justify-between">
              <h2 className="font-heading text-3xl font-bold">
                Crowd <span className="gradient-text">Favorites</span>
              </h2>
              <Link href="/menu" className="text-sm font-semibold text-pink hover:underline">
                Full menu →
              </Link>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.1}>
                  <TiltCard className="glass-card rounded-3xl p-6">
                    <div className="relative mb-4 h-40 overflow-hidden rounded-2xl">
                      <Image
                        src={demoMenuImages[i % demoMenuImages.length]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                      <span className="whitespace-nowrap font-heading font-bold text-pink">
                        ${item.price}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink-dim">{item.description}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-widest text-pink">
                Our Story
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
                More than coffee, it&apos;s a <span className="gradient-text">ritual</span>
              </h2>
              <p className="mt-4 text-ink-dim">
                {content?.aboutText ??
                  "A quiet corner for coffee lovers — thoughtful roasts, warm light, and time well spent."}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="glass-card rounded-2xl p-4">
                  <Star className="mx-auto mb-1 text-pink" size={20} />
                  <p className="font-heading text-xl font-bold">4.9</p>
                  <p className="text-xs text-ink-dim">Rating</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <Coffee className="mx-auto mb-1 text-orange" size={20} />
                  <p className="font-heading text-xl font-bold">30+</p>
                  <p className="text-xs text-ink-dim">Drinks</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <Heart className="mx-auto mb-1 text-purple" size={20} />
                  <p className="font-heading text-xl font-bold">10k+</p>
                  <p className="text-xs text-ink-dim">Happy sips</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <TiltCard className="glass-card glow-purple relative aspect-square overflow-hidden rounded-3xl">
                <Image src={aboutImageUrl} alt="Inside the cafe" fill className="object-cover" />
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* Visit Us */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-pink">
                Find Us
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
                Come <span className="gradient-text">say hi</span>
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-1">
                <div className="glass-card flex items-center gap-4 rounded-2xl p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink/15 text-pink">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <p className="font-heading font-bold">Address</p>
                    <p className="text-sm text-ink-dim">{content?.address ?? "123 Main Street"}</p>
                  </div>
                </div>
                <div className="glass-card flex items-center gap-4 rounded-2xl p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/15 text-orange">
                    <Clock size={20} />
                  </span>
                  <div>
                    <p className="font-heading font-bold">Hours</p>
                    <p className="text-sm text-ink-dim">
                      {content?.openingHours ?? "Mon–Sun: 9:00 AM – 11:00 PM"}
                    </p>
                  </div>
                </div>
                <div className="glass-card flex items-center gap-4 rounded-2xl p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple/15 text-purple">
                    <Phone size={20} />
                  </span>
                  <div>
                    <p className="font-heading font-bold">Phone</p>
                    <p className="text-sm text-ink-dim">{content?.phone ?? "+1 555 123 4567"}</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.15} className="glass-card glow-pink overflow-hidden rounded-3xl">
                {content?.mapEmbedUrl ? (
                  <iframe
                    src={content.mapEmbedUrl}
                    className="h-full min-h-[280px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-pink/10 via-orange/10 to-purple/10 p-8 text-center">
                    <MapPin className="text-pink" size={28} />
                    <p className="text-sm text-ink-dim">
                      Add a Google Maps embed link from the admin panel to show the map here.
                    </p>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* Gallery preview */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="mb-8 font-heading text-3xl font-bold">
              A peek <span className="gradient-text">inside</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryImages.map((img, i) => (
              <Reveal key={img.id} delay={i * 0.08}>
                <div className="glass-card relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={img.imageUrl} alt={img.caption ?? "Cafe photo"} fill className="object-cover transition-transform duration-500 hover:scale-110" />
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href="/gallery" variant="outline">
              See full gallery
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Reveal>
            <div className="glass-card glow-pink rounded-3xl p-12">
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                Ready to <span className="gradient-text">stop by?</span>
              </h2>
              <p className="mt-3 text-ink-dim">
                Reserve a table and we&apos;ll have your favorite spot ready.
              </p>
              <Button href="/book" variant="primary" className="mt-8 px-8 py-4 text-base">
                Reserve Your Spot
              </Button>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
