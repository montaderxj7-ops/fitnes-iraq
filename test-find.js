const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'كابتن-منتظر';
  const decodedSlug = decodeURIComponent(slug);
  console.log('Decoded:', decodedSlug);
  const profile = await prisma.coachProfile.findUnique({ where: { slug: decodedSlug } });
  console.log('Profile:', profile ? profile.name : 'NOT FOUND');
}

main().catch(console.error).finally(() => prisma.$disconnect());
