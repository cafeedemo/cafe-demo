import { PrismaClient, MenuCategory } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(process.cwd(), "scratch", "parsed_menu_items.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("Parsed menu JSON not found at:", jsonPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const items: { name: string; description: string | null; price: number; category: string }[] = JSON.parse(rawData);

  console.log(`Found ${items.length} items to seed.`);

  // Clean out previous menu items
  await prisma.menuItem.deleteMany({});
  console.log("Cleared existing menu items.");

  const validCategories = new Set(Object.values(MenuCategory));

  const dishes = Array.from({ length: 13 }, (_, i) => `/dishes/dish-${i + 1}.avif`);

  const dataToInsert = items.map((item, index) => {
    let cat = item.category as MenuCategory;
    if (!validCategories.has(cat)) {
      cat = MenuCategory.FOOD;
    }

    return {
      name: item.name,
      description: item.description || null,
      price: item.price,
      category: cat,
      imageUrl: dishes[index % dishes.length],
      isAvailable: true,
      isFeatured: index % 12 === 0, // feature roughly 1 out of 12 items
      sortOrder: index + 1,
    };
  });

  const created = await prisma.menuItem.createMany({
    data: dataToInsert,
  });

  console.log(`Successfully seeded ${created.count} menu items!`);
}

main()
  .catch((e) => {
    console.error("Error seeding menu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
