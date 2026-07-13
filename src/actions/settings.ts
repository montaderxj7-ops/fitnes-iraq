'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          coachName: "كابتن برو",
          appName: "Gym System",
          primaryColor: "#D6F854"
        }
      });
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
  try {
    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          coachName: data.coachName || "كابتن برو",
          coachAvatar: data.coachAvatar,
          appName: data.appName || "Gym System",
          appLogo: data.appLogo,
          primaryColor: data.primaryColor || "#D6F854",
          bio: data.bio,
          welcomeImage: data.welcomeImage,
          dashboardLoginEnabled: data.dashboardLoginEnabled ?? false,
          dashboardEmail: data.dashboardEmail,
          dashboardPassword: data.dashboardPassword,
          subscriptionTier: data.subscriptionTier || "pro"
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
    const methods = await prisma.paymentMethod.findMany({
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
    const method = await prisma.paymentMethod.create({
      data: {
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
