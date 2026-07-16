const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Generate 5MB string
    const largeString = "data:image/jpeg;base64," + "A".repeat(5 * 1024 * 1024);
    
    const coachData = {
      name: "كابتن لوفي",
      appName: "sharck gym",
      specialty: "كمال اجسام و تغذية",
      bio: "مرحباً بك",
      instagram: "",
      image: largeString,
      slug: "coach-test-123",
    };

    let user = await prisma.user.findFirst();
    if (!user) {
       user = await prisma.user.create({ data: { email: "test2@example.com" } });
    }

    const coach = await prisma.coachProfile.create({
      data: {
        ...coachData,
        userId: user.id,
      }
    });
    console.log("Success:", coach.id);
  } catch (err) {
    console.error("ERROR MESSAGE START:");
    console.error(err.message.substring(0, 500));
    console.error("... truncated ...");
    console.error(err.message.substring(err.message.length - 500));
  }
}

test().then(() => process.exit(0));
