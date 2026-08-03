import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { ContentForm } from "@/components/admin/ContentForm";

export default async function AdminContentPage() {
  const content = await prisma.siteContent.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  return (
    <div>
      <PageHeader title="Site Content" description="Edit the text shown on your homepage." />
      <ContentForm content={content} />
    </div>
  );
}
