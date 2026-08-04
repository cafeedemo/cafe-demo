import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { MediaLibraryManager } from "@/components/admin/MediaLibraryManager";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Every photo used across the site, in one place — upload new ones or reuse existing."
      />
      <MediaLibraryManager assets={assets} />
    </div>
  );
}
