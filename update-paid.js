const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.coachProfile.updateMany({
    data: { hasPaid: true }
  });
  console.log("Updated all existing coaches to hasPaid = true");
}
update().then(() => process.exit(0));
