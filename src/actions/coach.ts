"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function publishCoachProfile(data: {
  name: string;
  specialty: string;
  bio: string;
  instagram: string;
  image?: string | null;
  logo?: string | null;
  primaryColor?: string;
}) {
  try {
    // Generate a simple slug from the name
    let slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    if (!slug) {
      slug = `coach-${Date.now()}`;
    }

    // Check if slug exists, if so append a random number
    const existing = await prisma.coachProfile.findUnique({
      where: { slug }
    });

    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const coach = await prisma.coachProfile.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        bio: data.bio,
        instagram: data.instagram,
        image: data.image,
        logo: data.logo,
        primaryColor: data.primaryColor || "#D6F854",
        slug: slug,
      }
    });

    // Sync with Settings so dashboard reflects the published name and logo
    const settings = await prisma.settings.findFirst();
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: {
          coachName: data.name,
          coachAvatar: data.image || settings.coachAvatar,
          appLogo: data.logo || settings.appLogo,
        }
      });
    } else {
      await prisma.settings.create({
        data: {
          coachName: data.name,
          coachAvatar: data.image || "",
          appName: "Gym System",
          appLogo: data.logo || "",
          primaryColor: data.primaryColor || "#D6F854"
        }
      });
    }

    revalidatePath("/"); // Revalidate marketplace page
    revalidatePath("/dashboard");
    
    return { success: true, data: coach };
  } catch (error) {
    console.error("Error publishing coach profile:", error);
    return { success: false, error: "فشل في حفظ بيانات الكابتن" };
  }
}

export async function getMarketplaceCoaches() {
  try {
    const coaches = await prisma.coachProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return coaches;
  } catch (error) {
    console.error("Error fetching marketplace coaches:", error);
    return [];
  }
}

export async function getPublicCoachData(slug: string) {
  try {
    const profile = await prisma.coachProfile.findUnique({ where: { slug } });
    
    // Fallback to global settings if profile doesn't exist
    const settings = await prisma.settings.findFirst() || { coachName: "كابتن برو", appName: "Gym System", primaryColor: "#D6F854", appLogo: "" };
    const packages = await prisma.package.findMany({ orderBy: { createdAt: "desc" } });
    const paymentMethods = await prisma.paymentMethod.findMany({ where: { isActive: true } });

    return {
      success: true,
      coach: {
        name: profile?.name || settings.coachName,
        logo: profile?.logo || settings.appLogo || "",
        welcomeImage: profile?.image || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
        bio: profile?.bio || "مرحباً بك في فريقي! أنا هنا لأساعدك في الوصول إلى هدفك وتغيير حياتك للأفضل من خلال التزامك وتوجيهاتي المستمرة.",
        primaryColor: profile?.primaryColor || settings.primaryColor,
        intakeQuestions: [
          { id: 'age', title: 'كم عمرك؟', desc: 'يساعدنا في تحديد الجهد المناسب لك', type: 'number', placeholder: 'مثال: 25' },
          { id: 'weight', title: 'كم وزنك الحالي؟ (كجم)', desc: 'لمعرفة السعرات الحرارية المناسبة', type: 'number', placeholder: 'مثال: 75' },
          { id: 'height', title: 'كم طولك؟ (سم)', desc: 'لحساب كتلة الجسم بشكل دقيق', type: 'number', placeholder: 'مثال: 175' },
          { id: 'goal', title: 'ما هو هدفك الأساسي؟', desc: 'سنقوم ببناء خطتك بناءً على هذا الهدف', type: 'select', options: ['خسارة الوزن وتنشيف', 'بناء كتلة عضلية', 'زيادة الوزن', 'رفع اللياقة العامة', 'الاستشفاء من إصابة'] },
          { id: 'injuries', title: 'هل تعاني من أي إصابات؟', desc: 'يرجى ذكر أي مشاكل صحية أو إصابات سابقة', type: 'text', placeholder: 'اكتب "لا يوجد" إذا كنت سليماً..' },
        ],
        dashboardHeroImage: "https://pngimg.com/uploads/fitness/fitness_PNG19.png",
        dashboardHeroTopText: "جاهز للتحدي؟",
        dashboardHeroMainText: "مستعد لتمرين اليوم؟",
        dashboardHeroBottomText: "نحن قريبون جداً من تحقيق الهدف!",
        dashboardHeroProgress: "0",
        packages: packages.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          features: JSON.parse(p.features || "[]"),
          chatDays: String(p.chatDays),
          chatHours: String(p.chatHours),
          hasChat: p.hasChat,
          popular: p.popular
        })),
        paymentMethods: paymentMethods.map(p => ({
          id: p.id,
          name: p.name,
          details: p.details,
        }))
      }
    };
  } catch (error) {
    console.error("Error fetching public coach data:", error);
    return null;
  }
}

export async function updateCoachSettings(data: {
  coachName?: string;
  coachAvatar?: string;
  appName?: string;
  appLogo?: string;
  primaryColor?: string;
  bio?: string;
  welcomeImage?: string;
}) {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }
    
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data
    });
    
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "فشل في تحديث الإعدادات" };
  }
}

export async function updatePaymentMethods(methods: { id?: string; name: string; details: string; isActive?: boolean }[]) {
  try {
    // Delete missing ones
    const incomingIds = methods.map(m => m.id).filter(Boolean) as string[];
    await prisma.paymentMethod.deleteMany({
      where: { id: { notIn: incomingIds } }
    });

    for (const method of methods) {
      if (method.id) {
        await prisma.paymentMethod.update({
          where: { id: method.id },
          data: { name: method.name, details: method.details, isActive: method.isActive ?? true }
        });
      } else {
        await prisma.paymentMethod.create({
          data: { name: method.name, details: method.details, isActive: method.isActive ?? true }
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating payment methods:", error);
    return { success: false, error: "فشل في تحديث طرق الدفع" };
  }
}
