const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const subs = await prisma.pushSubscription.findMany();
  console.log('Total push subscriptions:', subs.length);
  if (subs.length > 0) {
    console.log('Latest sub:', subs[subs.length - 1]);
  }
}
check().finally(() => prisma.$disconnect());
