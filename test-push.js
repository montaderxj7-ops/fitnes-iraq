const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const subs = await prisma.pushSubscription.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('Total push subscriptions:', subs.length);
  if (subs.length > 0) {
    console.log('Latest sub:', subs[0]);
  }
}
check();
