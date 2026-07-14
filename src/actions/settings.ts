'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSettings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    let settings = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!settings) {
      // If they somehow reached here without a profile, return fallback data
      return { 
        success: true, 
        settings: {
          name: session.user.name || "كابتن برو",
          image: session.user.image || "",
          appName: "Gym System",
          primaryColor: "#D6F854"
        } 
      };
    }
    return { success: true, settings };
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSettings(data: {
  coachName?: string;
  coachAvatar?: string;
  appName?: string;
  appLogo?: string;
  primaryColor?: string;
  bio?: string;
  welcomeImage?: string;
  dashboardLoginEnabled?: boolean;
  dashboardEmail?: string;
  dashboardPassword?: string;
  subscriptionTier?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    try {
      let settings = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
      });

    if (settings) {
      settings = await prisma.coachProfile.update({
        where: { id: settings.id },
        data: {
          name: data.coachName || settings.name,
          image: data.coachAvatar !== undefined ? data.coachAvatar : settings.image,
          appName: data.appName || settings.appName,
          logo: data.appLogo !== undefined ? data.appLogo : settings.logo,
          primaryColor: data.primaryColor || settings.primaryColor,
          bio: data.bio || settings.bio,
          welcomeImage: data.welcomeImage !== undefined ? data.welcomeImage : settings.welcomeImage,
          dashboardLoginEnabled: data.dashboardLoginEnabled ?? settings.dashboardLoginEnabled,
          subscriptionTier: data.subscriptionTier || settings.subscriptionTier
        }
      });
    }
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/layout'); // or wherever settings are used
    
    return { success: true, settings };
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

export async function getPaymentMethods() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const methods = await prisma.paymentMethod.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'asc' }
    });
    return { success: true, methods };
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return { success: false, error: error.message };
  }
}

export async function addPaymentMethod(data: { name: string; details: string; isActive?: boolean }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const method = await prisma.paymentMethod.create({
      data: {
        coachId: profile.id,
        name: data.name,
        details: data.details,
        isActive: data.isActive ?? true
      }
    });
    revalidatePath('/dashboard/settings');
    return { success: true, method };
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentMethod(id: string, data: { name?: string; details?: string; isActive?: boolean }) {
  try {
    const method = await prisma.paymentMethod.update({
      where: { id },
      data
    });
    revalidatePath('/dashboard/settings');
    return { success: true, method };
  } catch (error: any) {
    console.error('Error updating payment method:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    await prisma.paymentMethod.delete({
      where: { id }
    });
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentMethodsBulk(payments: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    // Clear old methods
    await prisma.paymentMethod.deleteMany({
      where: { coachId: profile.id }
    });

    const pmData = [];
    const p = payments;
    
    if (p.zainCash && p.zainCashNumber) {
      pmData.push({ coachId: profile.id, name: "زين كاش (ZainCash)", details: `${p.zainCashNumber} - ${p.zainCashName || ""}` });
    }
    if (p.fib && p.fibAccount) {
      pmData.push({ coachId: profile.id, name: "FIB", details: `${p.fibAccount} - ${p.fibName || ""}` });
    }
    if (p.asiaHawala && p.asiaHawalaNumber) {
      pmData.push({ coachId: profile.id, name: "حوالة آسيا (AsiaHawala)", details: `${p.asiaHawalaNumber} - ${p.asiaHawalaName || ""}` });
    }
    if (p.masterCard && p.masterCardNumber) {
      pmData.push({ coachId: profile.id, name: "ماستر كارد (MasterCard)", details: `${p.masterCardNumber} - ${p.masterCardName || ""}` });
    }
    if (p.visaCard && p.visaCardNumber) {
      pmData.push({ coachId: profile.id, name: "فيزا كارد (Visa)", details: `${p.visaCardNumber} - ${p.visaCardName || ""}` });
    }
    if (p.card && p.cardLink) {
      pmData.push({ coachId: profile.id, name: "دفع إلكتروني (Card)", details: p.cardLink });
    }

    if (pmData.length > 0) {
      await prisma.paymentMethod.createMany({
        data: pmData
      });
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating bulk payment methods:', error);
    return { success: false, error: error.message };
  }
}

