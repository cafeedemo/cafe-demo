import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { MenuManager } from "@/components/admin/MenuManager";

export default async function AdminMenuPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const serialized = items.map((item) => ({
    ...item,
    price: item.price.toString(),
  }));

  return (
    <div>
      <PageHeader title="Menu" description="Add, edit, and manage your menu items." />
      <MenuManager items={serialized} />
    </div>
  );
}
