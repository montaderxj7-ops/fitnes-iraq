const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    let user = await prisma.user.create({ data: { email: `test-${Date.now()}@example.com`, name: "كابتن لوفي" } });
    
    const userId = user.id;
    const slug = user.name ? user.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "") : `coach-${Date.now()}`;

    const res = await prisma.coachProfile.upsert({
      where: { userId },
      update: { hasPaid: true },
      create: {
        userId,
        name: user.name || "كابتن",
        slug: slug || `coach-${Date.now()}`,
        specialty: "مدرب شخصي",
        bio: "مرحباً بك في فريقي!",
        instagram: "",
        hasPaid: true
      }
    });
    console.log("markCoachAsPaid success", res.id);
  } catch (err) {
    console.error("markCoachAsPaid error:", err.message);
  }
}
test().then(() => process.exit(0));
