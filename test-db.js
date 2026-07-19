const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
  const profiles = await prisma.coachProfile.findMany();
  console.log('CoachProfiles:', profiles);
}

main().finally(() => prisma.$disconnect());
