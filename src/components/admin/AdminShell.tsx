"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Images,
  LayoutGrid,
  CalendarCheck,
  ClipboardList,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { ROLES, canSee, type StaffRole } from "@/lib/roles";
import {
  subscribeRole,
  getRoleSnapshot,
  getRoleServerSnapshot,
  setRole,
} from "@/lib/role-store";

type NavItem = { href: string; label: string; icon: React.ElementType; section: string };

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, section: "overview" },
  { href: "/admin/floor", label: "Live Floor", icon: LayoutGrid, section: "floor" },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, section: "orders" },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarCheck, section: "reservations" },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, section: "menu" },
  { href: "/admin/media", label: "Media Library", icon: Images, section: "media" },
  { href: "/admin/setup", label: "Setup Cafe", icon: Settings, section: "setup" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useSyncExternalStore(
    subscribeRole,
    getRoleSnapshot,
    getRoleServerSnapshot,
  );

  const visible = NAV.filter((item) => canSee(role, item.section));

  const sidebar = (
    <>
      <Link href="/" className="mb-6 flex items-center gap-2 font-heading text-lg font-bold">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink to-orange text-xs font-bold text-white">
          LC
        </span>
        <span className="gradient-text">La Crest</span>
      </Link>

      <label className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
        Viewing as
      </label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as StaffRole)}
        className="mb-6 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm font-semibold focus:border-pink focus:outline-none"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <nav className="flex flex-1 flex-col gap-1">
        {visible.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-pink/20 to-orange/20 text-ink"
                  : "text-ink-dim hover:bg-black/[0.04] hover:text-ink",
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
        className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-dim hover:bg-black/[0.04] hover:text-pink"
      >
        <LogOut size={18} /> Sign out
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/10 bg-base-soft/60 p-6 md:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-black/10 bg-base/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <span className="font-heading font-bold gradient-text">La Crest Admin</span>
        <button onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle admin menu">
          {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <aside className="fixed inset-0 z-40 flex flex-col bg-base p-6 pt-20 md:hidden">
          {sidebar}
        </aside>
      )}

      <main className="flex-1 overflow-x-hidden p-6 pt-20 md:p-10 md:pt-10">{children}</main>
    </div>
  );
}
