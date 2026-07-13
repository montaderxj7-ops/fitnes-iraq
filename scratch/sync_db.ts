import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.coachProfile.findFirst({ orderBy: { id: 'desc' } });
  if (profile) {
    const settings = await prisma.settings.findFirst();
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: { coachName: profile.name, appName: profile.name, coachAvatar: profile.image || settings.coachAvatar, appLogo: profile.logo || settings.appLogo }
      });
      console.log('Synced Settings with CoachProfile:', profile.name);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
