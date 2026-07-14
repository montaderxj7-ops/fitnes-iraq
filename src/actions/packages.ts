'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getPackages() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return [];

    const packages = await prisma.package.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

export async function createPackage(data: {
  name: string;
  price: string;
  hasNutrition: boolean;
  hasChat: boolean;
  chatDays: string;
  chatHours: string;
  popular: boolean;
  features: string[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) throw new Error("No coach profile found");

    const newPackage = await prisma.package.create({
      data: {
        coachId: profile.id,
        name: data.name,
        price: data.price,
        hasNutrition: data.hasNutrition,
        hasChat: data.hasChat,
        chatDays: data.chatDays,
        chatHours: data.chatHours,
        popular: data.popular,
        features: JSON.stringify(data.features)
      }
    });
    revalidatePath('/dashboard/packages');
    return newPackage;
  } catch (error) {
    console.error("Error creating package:", error);
    throw new Error("Failed to create package");
  }
}

export async function updatePackage(id: string, data: {
  name: string;
  price: string;
  hasNutrition: boolean;
  hasChat: boolean;
  chatDays: string;
  chatHours: string;
  popular: boolean;
  features: string[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) throw new Error("No coach profile found");

    // verify ownership
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing || existing.coachId !== profile.id) throw new Error("Not found or unauthorized");

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        hasNutrition: data.hasNutrition,
        hasChat: data.hasChat,
        chatDays: data.chatDays,
        chatHours: data.chatHours,
        popular: data.popular,
        features: JSON.stringify(data.features)
      }
    });
    revalidatePath('/dashboard/packages');
    return updatedPackage;
  } catch (error) {
    console.error("Error updating package:", error);
    throw new Error("Failed to update package");
  }
}

export async function deletePackage(id: string) {
  try {
    await prisma.package.delete({
      where: { id }
    });
    revalidatePath('/dashboard/packages');
  } catch (error) {
    console.error("Error deleting package:", error);
    throw new Error("Failed to delete package");
  }
}
