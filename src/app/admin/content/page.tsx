import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { ContentForm } from "@/components/admin/ContentForm";

export default async function AdminContentPage() {
  const [content, mediaAssets] = await Promise.all([
    prisma.siteContent.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Site & Branding"
        description="Your cafe's name, story, location, hours, logo, and payment settings."
      />
      <ContentForm content={content} mediaAssets={mediaAssets} />
    </div>
  );
}
