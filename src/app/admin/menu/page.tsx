import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { MenuManager } from "@/components/admin/MenuManager";

export default async function AdminMenuPage() {
  const [items, mediaAssets] = await Promise.all([
    prisma.menuItem.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const serialized = items.map((item) => ({
    ...item,
    price: item.price.toString(),
  }));

  return (
    <div>
      <PageHeader title="Menu" description="Add, edit, and manage your menu items." />
      <MenuManager items={serialized} mediaAssets={mediaAssets} />
    </div>
  );
}
