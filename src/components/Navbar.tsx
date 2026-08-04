"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Coffee } from "lucide-react";
import { Button } from "./ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/book", label: "Book a Table" },
  { href: "/order", label: "Order" },
  { href: "/orders", label: "My Orders" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-base/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink to-purple">
            <Coffee size={18} />
          </span>
          <span className="gradient-text">Brew &amp; Bloom</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-dim transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Button href="/admin" variant="outline">
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </>
          ) : (
            <Button href="/book" variant="primary">
              Book a Table
            </Button>
          )}
        </div>

        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-dim"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Button href="/admin" variant="outline">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button href="/book" variant="primary">
                Book a Table
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
