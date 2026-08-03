import { prisma } from "@/lib/prisma";
import { DEMO_IMAGES } from "@/lib/demo-images";
import { HomeView } from "./HomeView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [content, featured, gallery, heroImage, aboutImage] = await Promise.all([
    prisma.siteContent.findUnique({ where: { id: "main" } }),
    prisma.menuItem.findMany({
      where: { isFeatured: true, isAvailable: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.galleryImage.findMany({
      where: { placement: "GALLERY" },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    prisma.galleryImage.findFirst({ where: { placement: "HERO" } }),
    prisma.galleryImage.findFirst({ where: { placement: "ABOUT" } }),
  ]);

  const serializedFeatured = featured.map((item) => ({
    ...item,
    price: item.price.toString(),
  }));

  return (
    <HomeView
      content={content}
      featured={serializedFeatured}
      gallery={gallery}
      heroImageUrl={heroImage?.imageUrl ?? DEMO_IMAGES.hero}
      aboutImageUrl={aboutImage?.imageUrl ?? DEMO_IMAGES.about}
      demoMenuImages={DEMO_IMAGES.menu}
      demoGalleryImages={DEMO_IMAGES.gallery}
    />
  );
}
