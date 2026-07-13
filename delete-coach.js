const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.coachProfile.deleteMany({
    where: {
      name: {
        contains: "منتظر"
      }
    }
  });
  console.log("Deleted count:", result.count);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
