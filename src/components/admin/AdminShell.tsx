"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Images,
  LayoutGrid,
  CalendarCheck,
  ClipboardList,
  FileText,
  LogOut,
  Coffee,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ElementType };

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/media", label: "Media Library", icon: Images },
  { href: "/admin/tables", label: "Table Layout", icon: LayoutGrid },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/content", label: "Site & Branding", icon: FileText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/10 bg-base-soft/60 p-6 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 font-heading text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink to-purple">
            <Coffee size={18} />
          </span>
          <span className="gradient-text">Brew &amp; Bloom</span>
        </Link>
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-ink-dim">
          Admin
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-pink/20 to-purple/20 text-ink"
                    : "text-ink-dim hover:bg-black/[0.03] hover:text-ink",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-dim hover:bg-black/[0.03] hover:text-pink"
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <main className="flex-1 overflow-x-hidden p-6 md:p-10">{children}</main>
    </div>
  );
}
