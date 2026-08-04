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
      name: "La Crest Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  await prisma.siteContent.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      cafeName: "La Crest",
      tagline: "North Indian & Continental, served with warmth",
      heroText: "Where every meal feels like an occasion",
      aboutText:
        "La Crest brings together North Indian comfort and Continental finesse in a warm, unhurried space. Whether it's a quick lunch near Infocity or a long dinner with family, our kitchen cooks everything fresh to order.",
      address:
        "Sur/Block 10/1, Gandhinagar Bypass Road, Opposite Sargasan, Infocity, Gandhinagar",
      phone: "+91 90000 00000",
      openingHours: "Mon–Sun: 11:00 AM – 11:00 PM",
      serviceOpenHour: 11,
      serviceCloseHour: 23,
    },
  });

  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        { name: "Paneer Butter Masala", description: "Cottage cheese in a silky tomato-cashew gravy", price: 320, category: "FOOD", imageUrl: "/dishes/dish-1.avif", isFeatured: true, sortOrder: 1 },
        { name: "Dal Makhani", description: "Black lentils slow-cooked overnight with butter and cream", price: 280, category: "FOOD", imageUrl: "/dishes/dish-2.avif", isFeatured: true, sortOrder: 2 },
        { name: "Tandoori Platter", description: "Assorted kebabs straight off the tandoor", price: 480, category: "SPECIALS", imageUrl: "/dishes/dish-3.avif", isFeatured: true, sortOrder: 3 },
        { name: "Butter Naan", description: "Soft leavened bread brushed with butter", price: 60, category: "FOOD", imageUrl: "/dishes/dish-4.avif", sortOrder: 4 },
        { name: "Penne Alfredo", description: "Penne tossed in a creamy parmesan sauce", price: 340, category: "FOOD", imageUrl: "/dishes/dish-5.avif", sortOrder: 5 },
        { name: "Grilled Veg Sandwich", description: "Char-grilled vegetables, cheese, herb butter", price: 190, category: "FOOD", imageUrl: "/dishes/dish-6.avif", sortOrder: 6 },
        { name: "Veg Manchurian", description: "Crisp vegetable dumplings in a tangy sauce", price: 260, category: "FOOD", imageUrl: "/dishes/dish-7.avif", sortOrder: 7 },
        { name: "Masala Chai", description: "Slow-brewed with fresh ginger and cardamom", price: 60, category: "TEA", imageUrl: "/dishes/dish-8.avif", sortOrder: 8 },
        { name: "Filter Coffee", description: "South Indian style, strong and frothy", price: 80, category: "COFFEE", imageUrl: "/dishes/dish-9.avif", sortOrder: 9 },
        { name: "Cold Coffee", description: "Blended with ice cream and a cocoa dust", price: 160, category: "COFFEE", imageUrl: "/dishes/dish-10.avif", sortOrder: 10 },
        { name: "Gulab Jamun", description: "Warm milk dumplings in cardamom syrup", price: 140, category: "PASTRY", imageUrl: "/dishes/dish-11.avif", sortOrder: 11 },
        { name: "Chocolate Brownie", description: "Served warm with vanilla ice cream", price: 180, category: "PASTRY", imageUrl: "/dishes/dish-12.avif", sortOrder: 12 },
        { name: "Chef's Thali", description: "A full plate of the day's best — ask your server", price: 420, category: "SPECIALS", imageUrl: "/dishes/dish-13.avif", sortOrder: 13 },
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

  const mediaCount = await prisma.mediaAsset.count();
  if (mediaCount === 0) {
    await prisma.mediaAsset.createMany({
      data: [
        ...Array.from({ length: 13 }, (_, i) => ({
          url: `/dishes/dish-${i + 1}.avif`,
          source: "GIT" as const,
          category: "DISH" as const,
          label: `Dish photo ${i + 1}`,
        })),
        { url: DEMO_IMAGES.hero, source: "GIT" as const, category: "AMBIENCE" as const, label: "Hero ambience" },
        { url: DEMO_IMAGES.about, source: "GIT" as const, category: "AMBIENCE" as const, label: "About ambience" },
        ...DEMO_IMAGES.gallery.map((url, i) => ({
          url,
          source: "GIT" as const,
          category: "AMBIENCE" as const,
          label: `Ambience ${i + 1}`,
        })),
      ],
    });
  }

  // A starter 5x5 floor plan: rows 1..5, a realistic scattered arrangement.
  const tableCount = await prisma.table.count();
  if (tableCount === 0) {
    const layout: { row: number; col: number; seats: number; shape: "SQUARE" | "ROUND" }[] = [
      { row: 1, col: 1, seats: 2, shape: "SQUARE" },
      { row: 1, col: 3, seats: 2, shape: "SQUARE" },
      { row: 1, col: 5, seats: 4, shape: "ROUND" },
      { row: 2, col: 2, seats: 4, shape: "SQUARE" },
      { row: 2, col: 4, seats: 4, shape: "SQUARE" },
      { row: 3, col: 1, seats: 6, shape: "ROUND" },
      { row: 3, col: 3, seats: 6, shape: "ROUND" },
      { row: 3, col: 5, seats: 2, shape: "SQUARE" },
      { row: 4, col: 2, seats: 4, shape: "SQUARE" },
      { row: 4, col: 4, seats: 8, shape: "ROUND" },
    ];

    for (const [i, t] of layout.entries()) {
      await prisma.table.create({
        data: {
          number: i + 1,
          seats: t.seats,
          shape: t.shape,
          gridRow: t.row,
          gridCol: t.col,
        },
      });
    }
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
