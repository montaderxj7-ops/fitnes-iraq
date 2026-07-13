'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPackages() {
  try {
    const packages = await prisma.package.findMany({
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
    const newPackage = await prisma.package.create({
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
    return newPackage;
  } catch (error) {
    console.error("Error creating package:", error);
    throw new Error("Failed to create package");
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
