const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEnum() {
  const values = [
    'SOUP',
    'STARTERS',
    'CONTINENTAL',
    'CHINESE',
    'INDIAN_MAIN',
    'BREADS_RICE',
    'BEVERAGES',
    'SALADS',
    'DESSERTS'
  ];

  for (const v of values) {
    try {
      console.log(`Adding enum value ${v}...`);
      await prisma.$executeRawUnsafe(`ALTER TYPE "MenuCategory" ADD VALUE IF NOT EXISTS '${v}'`);
      console.log(`  Added ${v}`);
    } catch (e) {
      console.log(`  Note for ${v}:`, e.message);
    }
  }

  console.log('Enum update complete!');
}

updateEnum()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
