require('dotenv').config();
const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const methods = await prisma.paymentMethod.findMany();
    console.log("METHODS:", methods);
    const coaches = await prisma.coachProfile.findMany({
      select: { name: true, appName: true, logo: true, slug: true, userId: true }
    });
    console.log("COACHES:", coaches);
  } catch(e) {
    console.error('Prisma Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
