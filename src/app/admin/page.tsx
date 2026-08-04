import { UtensilsCrossed, Images, CalendarCheck, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const [menuCount, mediaCount, tableCount, upcoming] = await Promise.all([
    prisma.menuItem.count(),
    prisma.mediaAsset.count(),
    prisma.table.count(),
    prisma.booking.findMany({
      orderBy: { bookedFor: "asc" },
      take: 5,
      where: { status: { in: ["BOOKED", "SEATED"] } },
      include: { table: true },
    }),
  ]);

  const stats = [
    { label: "Menu items", value: menuCount, icon: UtensilsCrossed },
    { label: "Media assets", value: mediaCount, icon: Images },
    { label: "Tables", value: tableCount, icon: LayoutGrid },
  ];

  return (
    <div>
      <PageHeader title="Overview" description="A quick look at your cafe today." />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-6">
            <stat.icon className="mb-3 text-pink" size={24} />
            <p className="font-heading text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-ink-dim">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card mt-8 rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
          <CalendarCheck size={18} className="text-pink" /> Upcoming bookings
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-dim">No upcoming bookings yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-black/10">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {b.customerName} · Table {b.table.label}
                  </p>
                  <p className="text-ink-dim">
                    {b.bookedFor.toLocaleString()} · Party of {b.partySize}
                  </p>
                </div>
                <span className="rounded-full bg-black/[0.03] px-3 py-1 text-xs text-ink-dim">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
