const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findFirst();
  if (settings && settings.appLogo) {
    console.log("Found appLogo in settings:", settings.appLogo.substring(0, 50) + "...");
    const coaches = await prisma.coachProfile.findMany({
      where: { logo: null }
    });
    
    console.log(`Found ${coaches.length} coaches without logo. Updating...`);
    for (const coach of coaches) {
      await prisma.coachProfile.update({
        where: { id: coach.id },
        data: { logo: settings.appLogo }
      });
      console.log(`Updated coach: ${coach.name}`);
    }
  } else {
    console.log("No appLogo found in settings!");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
