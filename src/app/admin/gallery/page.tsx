import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/admin/GalleryManager";

export default async function AdminGalleryPage() {
  const [images, mediaAssets] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Gallery" description="Manage the photos shown on your public gallery." />
      <GalleryManager images={images} mediaAssets={mediaAssets} />
    </div>
  );
}
