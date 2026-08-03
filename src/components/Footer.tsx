import Link from "next/link";
import { AtSign, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-base-soft/50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-xl font-bold gradient-text">Brew &amp; Bloom</h3>
            <p className="mt-2 text-sm text-ink-dim">
              Sip. Vibe. Repeat. Your favorite corner for coffee, good food, and better company.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-ink-dim">
            <span className="font-heading font-semibold text-ink">Visit us</span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-pink" /> 123 Main Street
            </span>
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-pink" /> +1 555 123 4567
            </span>
            <span className="flex items-center gap-2">
              <AtSign size={16} className="text-pink" /> brewandbloom
            </span>
          </div>

          <div className="flex flex-col gap-2 text-sm text-ink-dim">
            <span className="font-heading font-semibold text-ink">Explore</span>
            <Link href="/menu" className="hover:text-ink">Menu</Link>
            <Link href="/gallery" className="hover:text-ink">Gallery</Link>
            <Link href="/reserve" className="hover:text-ink">Reserve a Table</Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-ink-dim">
          © {new Date().getFullYear()} Brew &amp; Bloom Cafe. Powered by Quellflow.
        </div>
      </div>
    </footer>
  );
}
