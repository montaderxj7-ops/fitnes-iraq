const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Wiping database...");
  await prisma.user.deleteMany({});
  await prisma.coachProfile.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.workoutPlan.deleteMany({});
  console.log("Database wiped successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
