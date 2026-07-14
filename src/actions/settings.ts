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
