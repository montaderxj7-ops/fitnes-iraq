'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// -- Supplement Library --
export async function getSupplementItems() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const supplementItems = await prisma.supplementItem.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return { success: true, supplementItems };
  } catch (error) {
    console.error("Error fetching supplement items:", error);
    return { success: false, error: "Failed to fetch supplement items" };
  }
}

// Add new supplement item
export async function addSupplementItem(data: { name: string; description?: string; mediaUrl?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const supplementItem = await prisma.supplementItem.create({
      data: {
        coachId: profile.id,
        name: data.name,
        description: data.description || null,
        mediaUrl: data.mediaUrl || null,
      }
    });
    return { success: true, supplementItem };
  } catch (error) {
    console.error("Error adding supplement item:", error);
    return { success: false, error: "Failed to add supplement item" };
  }
}

// -- Supplement Plans --
export async function getSupplementPlan(clientId: string) {
  try {
    const plan = await prisma.supplementPlan.findFirst({
      where: { clientId },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: { supplement: true }
            }
          }
        }
      }
    });
    return { success: true, plan };
  } catch (error) {
    console.error("Error fetching supplement plan:", error);
    return { success: false, error: "Failed to fetch supplement plan" };
  }
}

// Create or update full supplement plan
export async function saveSupplementPlan(clientId: string, planData: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    // Basic upsert approach: delete old plan entirely and recreate
    await prisma.supplementPlan.deleteMany({
      where: { clientId }
    });

    const newPlan = await prisma.supplementPlan.create({
      data: {
        coachId: profile.id,
        clientId,
        name: "خطة المكملات",
        days: {
          create: planData.days.map((day: any, dayIndex: number) => ({
            name: day.name,
            order: dayIndex,
            items: {
              create: day.items.map((item: any, itemIndex: number) => ({
                supplementId: item.supplementId,
                amount: item.amount,
                timing: item.timing,
                order: itemIndex
              }))
            }
          }))
        }
      }
    });

    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error("Error saving supplement plan:", error);
    return { success: false, error: "Failed to save supplement plan" };
  }
}

// Get all coach supplement plans (for cloning)
export async function getAllCoachSupplementPlans() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const plans = await prisma.supplementPlan.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    const clientIds = plans.map(p => p.clientId);
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true }
    });
    
    const clientMap = new Map(clients.map(c => [c.id, c.name]));

    const plansWithClient = plans.map(p => ({
      ...p,
      client: { name: clientMap.get(p.clientId) || null }
    }));

    return { success: true, plans: plansWithClient };
  } catch (error) {
    console.error("Error fetching coach supplement plans:", error);
    return { success: false, error: "Failed to fetch coach supplement plans" };
  }
}

// Get specific supplement plan details by ID
export async function getSupplementPlanById(planId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const plan = await prisma.supplementPlan.findUnique({
      where: { id: planId },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: { supplement: true }
            }
          }
        }
      }
    });
    
    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    return { success: true, plan };
  } catch (error) {
    console.error("Error fetching supplement plan by id:", error);
    return { success: false, error: "Failed to fetch supplement plan by id" };
  }
}
