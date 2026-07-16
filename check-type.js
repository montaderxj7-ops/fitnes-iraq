const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const result = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'CoachProfile' AND column_name = 'image';
  `;
  console.log(result);
}
check().then(() => process.exit(0));
