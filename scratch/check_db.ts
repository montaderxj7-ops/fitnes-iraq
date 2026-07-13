import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findFirst();
  console.log('Settings:', settings);
  const profiles = await prisma.coachProfile.findMany();
  console.log('Profiles:', profiles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
