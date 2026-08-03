import { UtensilsCrossed, Images, CalendarCheck, Users, Clock } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function SuperadminOverview() {
  const [menuCount, galleryCount, pendingCount, adminCount] = await Promise.all([
    prisma.menuItem.count(),
    prisma.galleryImage.count(),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } }),
  ]);

  const stats = [
    { label: "Menu items", value: menuCount, icon: UtensilsCrossed },
    { label: "Gallery photos", value: galleryCount, icon: Images },
    { label: "Pending reservations", value: pendingCount, icon: Clock },
    { label: "Admin accounts", value: adminCount, icon: Users },
  ];

  return (
    <div>
      <PageHeader
        title="Platform Overview"
        description="Quellflow super admin control center for Brew & Bloom Cafe."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-6">
            <stat.icon className="mb-3 text-purple" size={24} />
            <p className="font-heading text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-ink-dim">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card mt-8 flex items-center gap-3 rounded-2xl p-6 text-sm text-ink-dim">
        <CalendarCheck size={18} className="text-purple" />
        As superadmin you have full access to menu, gallery, reservations, site content, and
        admin account management.
      </div>
    </div>
  );
}
