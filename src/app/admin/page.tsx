import { UtensilsCrossed, Images, CalendarCheck, Clock } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const [menuCount, galleryCount, pendingCount, upcoming] = await Promise.all([
    prisma.menuItem.count(),
    prisma.galleryImage.count(),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.reservation.findMany({
      orderBy: { date: "asc" },
      take: 5,
      where: { status: { not: "CANCELLED" } },
    }),
  ]);

  const stats = [
    { label: "Menu items", value: menuCount, icon: UtensilsCrossed },
    { label: "Gallery photos", value: galleryCount, icon: Images },
    { label: "Pending reservations", value: pendingCount, icon: Clock },
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
          <CalendarCheck size={18} className="text-pink" /> Upcoming reservations
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-dim">No upcoming reservations yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-black/10">
            {upcoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-ink-dim">
                    {r.date.toLocaleDateString()} · {r.timeSlot} · Party of {r.partySize}
                  </p>
                </div>
                <span className="rounded-full bg-black/[0.03] px-3 py-1 text-xs text-ink-dim">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
