const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, 'parsed_menu_items.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const items = JSON.parse(rawData);

  console.log(`Found ${items.length} items to seed.`);

  await prisma.menuItem.deleteMany({});
  console.log('Cleared existing menu items.');

  const dishes = Array.from({ length: 13 }, (_, i) => `/dishes/dish-${i + 1}.avif`);

  const dataToInsert = items.map((item, index) => {
    return {
      name: item.name,
      description: item.description || null,
      price: item.price,
      category: item.category,
      imageUrl: dishes[index % dishes.length],
      isAvailable: true,
      isFeatured: index % 12 === 0,
      sortOrder: index + 1,
    };
  });

  const created = await prisma.menuItem.createMany({
    data: dataToInsert,
  });

  console.log(`Successfully seeded ${created.count} menu items into the database!`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
