const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findMany({ include: { accounts: true, coachProfile: true } })
  .then(u => console.log(JSON.stringify(u, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
