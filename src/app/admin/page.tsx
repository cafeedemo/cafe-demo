import Link from "next/link";
import { UtensilsCrossed, LayoutGrid, ClipboardList, IndianRupee, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [menuCount, tableCount, openSessions, pendingOrders, upcoming, todayClosed] =
    await Promise.all([
      prisma.menuItem.count({ where: { isAvailable: true } }),
      prisma.table.count({ where: { isActive: true } }),
      prisma.diningSession.count({ where: { status: { in: ["OPEN", "BILLED"] } } }),
      prisma.order.count({ where: { status: { in: ["PLACED", "PREPARING"] } } }),
      prisma.reservation.findMany({
        where: { status: "RESERVED", startAt: { gte: new Date() } },
        include: { table: true },
        orderBy: { startAt: "asc" },
        take: 5,
      }),
      prisma.diningSession.findMany({
        where: { status: "CLOSED", closedAt: { gte: startOfDay } },
        include: { orders: { include: { items: true } } },
      }),
    ]);

  const revenueToday = todayClosed.reduce(
    (sum, s) =>
      sum +
      s.orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((t, o) => t + o.items.reduce((x, i) => x + Number(i.price) * i.qty, 0), 0),
    0,
  );

  const stats = [
    { label: "Tables seated", value: openSessions, icon: LayoutGrid, href: "/admin/floor" },
    { label: "Orders in kitchen", value: pendingOrders, icon: ClipboardList, href: "/admin/orders" },
    { label: "Dishes on menu", value: menuCount, icon: UtensilsCrossed, href: "/admin/menu" },
    { label: "Active tables", value: tableCount, icon: LayoutGrid, href: "/admin/setup" },
  ];

  return (
    <div>
      <PageHeader title="Overview" description="Today at a glance." />

      <div className="glass-card mb-6 flex items-center gap-4 rounded-2xl p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/20 text-lime">
          <IndianRupee size={22} />
        </span>
        <div>
          <p className="font-heading text-3xl font-bold">₹{revenueToday.toFixed(2)}</p>
          <p className="text-sm text-ink-dim">Collected today ({todayClosed.length} tabs closed)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-1"
          >
            <stat.icon className="mb-3 text-pink" size={22} />
            <p className="font-heading text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-ink-dim">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="glass-card mt-8 rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
          <CalendarCheck size={18} className="text-pink" /> Next reservations
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-dim">Nothing booked yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-black/10">
            {upcoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {r.customerName} · Table {r.table.number}
                  </p>
                  <p className="text-ink-dim">
                    {r.startAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · party of {r.partySize}
                  </p>
                </div>
                <Link
                  href="/admin/reservations"
                  className="text-xs font-semibold text-pink hover:underline"
                >
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
