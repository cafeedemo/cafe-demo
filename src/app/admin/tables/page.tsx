import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { TableLayoutEditor } from "@/components/admin/TableLayoutEditor";

export default async function AdminTablesPage() {
  const tables = await prisma.table.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Table Layout"
        description="Design your floor plan — customers book straight from this layout."
      />
      <TableLayoutEditor tables={tables} />
    </div>
  );
}
