const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: { clientProfile: true, coachProfile: true }
  });
  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(`User: ${u.id} - ${u.email}`);
    if (u.coachProfile) console.log(`  Coach: ${u.coachProfile.name}`);
    if (u.clientProfile) {
      console.log(`  Client ID: ${u.clientProfile.id}`);
    }
  }

  const subs = await prisma.pushSubscription.findMany();
  for (const s of subs) {
    console.log(`Sub: ${s.id} is for User: ${s.userId}`);
  }
}
check();
