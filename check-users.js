const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: { coachProfile: true, accounts: true }
  });
  console.log(JSON.stringify(users, null, 2));
}
check().then(() => process.exit(0));
