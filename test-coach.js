const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const coaches = await prisma.coachProfile.findMany();
  for (const c of coaches) {
    console.log(`Coach: ${c.name}, Logo: ${c.logo}`);
  }
}
check();
