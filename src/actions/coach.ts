"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function publishCoachProfile(data: {
  name: string;
  specialty: string;
  bio: string;
  instagram: string;
  image?: string | null;
  logo?: string | null;
  primaryColor?: string;
  firstPackage?: {
    name: string;
    price: string;
    hasChat: boolean;
    chatDays: string;
    chatHours: string;
    features: string[];
  };
  payments?: {
    zainCash?: boolean;
    zainCashNumber?: string;
    zainCashName?: string;
    fib?: boolean;
    fibAccount?: string;
    fibName?: string;
    asiaHawala?: boolean;
    asiaHawalaNumber?: string;
    asiaHawalaName?: string;
    masterCard?: boolean;
    masterCardNumber?: string;
    masterCardName?: string;
    visaCard?: boolean;
    visaCardNumber?: string;
    visaCardName?: string;
    card?: boolean;
    cardLink?: string;
  };
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }

    // Check if user already has a profile
    const existingProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id }
    });

    let slug = existingProfile?.slug;

    if (!slug) {
      // Generate a simple slug from the name
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      if (!slug) {
        slug = `coach-${Date.now()}`;
      }

      // Check if slug exists, if so append a random number
      const existingSlug = await prisma.coachProfile.findUnique({
        where: { slug }
      });

      if (existingSlug) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    const coachData = {
      name: data.name,
      specialty: data.specialty,
      bio: data.bio,
      instagram: data.instagram,
      image: data.image,
      logo: data.logo,
      primaryColor: data.primaryColor || "#D6F854",
      slug: slug,
    };

    let coach;
    if (existingProfile) {
      coach = await prisma.coachProfile.update({
        where: { id: existingProfile.id },
        data: coachData
      });
      // If they are re-publishing, clear their old payment methods to replace with new ones
      await prisma.paymentMethod.deleteMany({
        where: { coachId: coach.id }
      });
    } else {
      coach = await prisma.coachProfile.create({
        data: {
          ...coachData,
          userId: session.user.id,
        }
      });
    }

    // Create the first package if provided and if they don't already have packages
    if (data.firstPackage && data.firstPackage.name.trim() !== "") {
      const existingPackages = await prisma.package.count({ where: { coachId: coach.id } });
      if (existingPackages === 0) {
        await prisma.package.create({
          data: {
            coachId: coach.id,
            name: data.firstPackage.name,
            price: data.firstPackage.price,
            hasChat: data.firstPackage.hasChat,
            chatDays: data.firstPackage.chatDays,
            chatHours: data.firstPackage.chatHours,
            features: JSON.stringify(data.firstPackage.features),
            popular: true, // make the first package popular by default
            hasNutrition: true, // default to true for the main package
          }
        });
      }
    }

    // Create Payment Methods based on the provided payments object
    if (data.payments) {
      const pmData = [];
      const p = data.payments;
      
      if (p.zainCash && p.zainCashNumber) {
        pmData.push({ coachId: coach.id, name: "زين كاش (ZainCash)", details: `${p.zainCashNumber} - ${p.zainCashName || ""}` });
      }
      if (p.fib && p.fibAccount) {
        pmData.push({ coachId: coach.id, name: "FIB", details: `${p.fibAccount} - ${p.fibName || ""}` });
      }
      if (p.asiaHawala && p.asiaHawalaNumber) {
        pmData.push({ coachId: coach.id, name: "حوالة آسيا (AsiaHawala)", details: `${p.asiaHawalaNumber} - ${p.asiaHawalaName || ""}` });
      }
      if (p.masterCard && p.masterCardNumber) {
        pmData.push({ coachId: coach.id, name: "ماستر كارد (MasterCard)", details: `${p.masterCardNumber} - ${p.masterCardName || ""}` });
      }
      if (p.visaCard && p.visaCardNumber) {
        pmData.push({ coachId: coach.id, name: "فيزا كارد (VisaCard)", details: `${p.visaCardNumber} - ${p.visaCardName || ""}` });
      }
      if (p.card && p.cardLink) {
        pmData.push({ coachId: coach.id, name: "دفع إلكتروني (Card)", details: p.cardLink });
      }
      
      if (pmData.length > 0) {
        await prisma.paymentMethod.createMany({
          data: pmData
        });
      }
    }

    // Upgrade the user to COACH role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "COACH" }
    });

    // Settings logic removed because Settings model is deleted. Profile handles it.
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
    const decodedSlug = decodeURIComponent(slug);
    const profile = await prisma.coachProfile.findUnique({ where: { slug: decodedSlug } });
    
    const settings = profile || { name: "كابتن برو", appName: "Gym System", primaryColor: "#D6F854", logo: "" };
    // Always fallback to a demo profile if not found, instead of crashing
    if (!profile) {
      return {
        success: false,
        error: "Coach not found"
      };
    }
    
    const packages = await prisma.package.findMany({ where: { coachId: profile.id }, orderBy: { createdAt: "desc" } });
    const paymentMethods = await prisma.paymentMethod.findMany({ where: { coachId: profile.id, isActive: true } });

    return {
      success: true,
      coach: {
        name: profile?.name || settings.name,
        logo: profile?.logo || settings.logo || "",
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

export async function updateCoachSettings(coachId: string, data: {
  name?: string;
  logo?: string;
  primaryColor?: string;
  bio?: string;
  image?: string;
}) {
  try {
    const updated = await prisma.coachProfile.update({
      where: { id: coachId },
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    // Delete missing ones
    const incomingIds = methods.map(m => m.id).filter(Boolean) as string[];
    await prisma.paymentMethod.deleteMany({
      where: { coachId: profile.id, id: { notIn: incomingIds } }
    });

    for (const method of methods) {
      if (method.id) {
        await prisma.paymentMethod.update({
          where: { id: method.id },
          data: { name: method.name, details: method.details, isActive: method.isActive ?? true }
        });
      } else {
        await prisma.paymentMethod.create({
          data: { coachId: profile.id, name: method.name, details: method.details, isActive: method.isActive ?? true }
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating payment methods:", error);
    return { success: false, error: "فشل في تحديث طرق الدفع" };
  }
}
