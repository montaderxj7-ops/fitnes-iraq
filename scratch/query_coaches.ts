import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const coaches = await prisma.coachProfile.findMany();
  console.log('All CoachProfiles:', JSON.stringify(coaches, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
