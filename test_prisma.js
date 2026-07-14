const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const coach = await prisma.coachProfile.create({
      data: {
        userId: 'test-user-id-1234',
        name: 'حسن علي',
        specialty: 'كمال اجسام و تغذية',
        bio: 'مرحباً بك في فريقي! أنا هنا لأساعدك',
        instagram: 'https://www.instagram.com/odessaazion?igsh',
        primaryColor: '#D6F854',
        slug: 'حسن-علي'
      }
    });
    console.log('Success:', coach.id);
  } catch(e) {
    console.error('Prisma Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
