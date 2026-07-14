const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const coaches = await prisma.coachProfile.findMany();
  console.log("SLUGS:");
  coaches.forEach(c => console.log(c.slug));
}

main().catch(console.error).finally(() => prisma.$disconnect());
