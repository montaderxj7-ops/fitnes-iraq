const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const coachData = {
      name: "كابتن لوفي",
      appName: "sharck gym",
      specialty: "كمال اجسام و تغذية",
      bio: "مرحباً بك في فريقي!",
      instagram: "https://instagram.com/...",
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...",
      welcomeImage: undefined,
      dashboardHeroImage: undefined,
      dashboardHeroTopText: undefined,
      dashboardHeroMainText: undefined,
      dashboardHeroBottomText: undefined,
      logo: undefined,
      primaryColor: "#00F0FF",
      slug: "coach-1721021482933",
    };

    // Assume user exists
    let user = await prisma.user.findFirst();
    if (!user) {
       user = await prisma.user.create({ data: { email: "test@example.com" } });
    }

    const coach = await prisma.coachProfile.create({
      data: {
        ...coachData,
        userId: user.id,
      }
    });
    console.log("Success:", coach.id);
  } catch (err) {
    console.error("ERROR MESSAGE:", err.message);
  }
}

test().then(() => process.exit(0));
