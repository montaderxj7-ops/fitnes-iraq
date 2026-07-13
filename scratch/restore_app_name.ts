import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findFirst();
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data: { appName: "Gym System" }
    });
    console.log('Restored App Name');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
