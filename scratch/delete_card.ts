import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.coachProfile.deleteMany({
    where: {
      name: {
        contains: 'جماوي'
      }
    }
  });
  console.log(`Deleted ${result.count} CoachProfiles matching 'جماوي'`);

  // Let's also check if it's in Settings
  const settingsResult = await prisma.settings.updateMany({
    where: {
      coachName: {
        contains: 'جماوي'
      }
    },
    data: {
      coachName: 'كابتن برو',
      bio: null,
      coachAvatar: null,
    }
  });
  console.log(`Updated ${settingsResult.count} Settings matching 'جماوي'`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
