import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function SuperadminUsersPage() {
  const [users, session] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    auth(),
  ]);

  const serialized = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));

  return (
    <div>
      <PageHeader
        title="Admin Users"
        description="Manage cafe owner (admin) accounts. Only Quellflow can create or remove admins."
      />
      <UsersManager users={serialized} currentUserId={session?.user?.id ?? ""} />
    </div>
  );
}
