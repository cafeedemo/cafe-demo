import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_IMAGES } from "../src/lib/demo-images";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "owner@cafe.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "CafeOwner@123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Cafe Owner",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        {
          name: "Iced Vanilla Latte",
          description: "Espresso, cold milk, vanilla syrup, ice",
          price: 4.5,
          category: "COFFEE",
          imageUrl: DEMO_IMAGES.menu[0],
          isFeatured: true,
          sortOrder: 1,
        },
        {
          name: "Matcha Cloud",
          description: "Ceremonial matcha with whipped oat foam",
          price: 5.0,
          category: "TEA",
          imageUrl: DEMO_IMAGES.menu[1],
          isFeatured: true,
          sortOrder: 2,
        },
        {
          name: "Butter Croissant",
          description: "Flaky, buttery, baked fresh daily",
          price: 3.25,
          category: "PASTRY",
          sortOrder: 3,
        },
        {
          name: "Avocado Toast",
          description: "Sourdough, smashed avo, chili flakes, lime",
          price: 7.5,
          category: "FOOD",
          sortOrder: 4,
        },
        {
          name: "Cold Brew Float",
          description: "Cold brew topped with vanilla ice cream",
          price: 6.0,
          category: "SPECIALS",
          imageUrl: DEMO_IMAGES.menu[2],
          isFeatured: true,
          sortOrder: 5,
        },
        {
          name: "Espresso",
          description: "Double shot, rich and bold",
          price: 3.0,
          category: "COFFEE",
          sortOrder: 6,
        },
      ],
    });
  }

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: [
        { imageUrl: DEMO_IMAGES.hero, placement: "HERO", sortOrder: 0 },
        { imageUrl: DEMO_IMAGES.about, placement: "ABOUT", sortOrder: 0 },
        ...DEMO_IMAGES.gallery.map((url, i) => ({
          imageUrl: url,
          placement: "GALLERY" as const,
          sortOrder: i,
        })),
      ],
    });
  }

  const tableCount = await prisma.table.count();
  if (tableCount === 0) {
    await prisma.table.createMany({
      data: [
        { label: "T1", seats: 2, x: 10, y: 15 },
        { label: "T2", seats: 2, x: 30, y: 15 },
        { label: "T3", seats: 4, x: 50, y: 15 },
        { label: "T4", seats: 4, x: 70, y: 15 },
        { label: "T5", seats: 4, x: 10, y: 45 },
        { label: "T6", seats: 6, x: 30, y: 45 },
        { label: "T7", seats: 6, x: 50, y: 45 },
        { label: "T8", seats: 2, x: 70, y: 45 },
      ],
    });
  }

  const mediaCount = await prisma.mediaAsset.count();
  if (mediaCount === 0) {
    await prisma.mediaAsset.createMany({
      data: Array.from({ length: 13 }, (_, i) => ({
        url: `/dishes/dish-${i + 1}.avif`,
        source: "GIT" as const,
        category: "DISH" as const,
        label: `Dish photo ${i + 1}`,
      })),
    });
  }

  console.log("Seed complete:");
  console.log(`  Admin -> ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
