'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// -- Food Library --
export async function getFoodItems() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const foodItems = await prisma.foodItem.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return { success: true, foodItems };
  } catch (error) {
    console.error("Error fetching food items:", error);
    return { success: false, error: "Failed to fetch food items" };
  }
}

// Add new food item
export async function addFoodItem(data: { name: string; calories: number; protein: number; carbs: number; fats: number; mediaUrl?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const foodItem = await prisma.foodItem.create({
      data: {
        coachId: profile.id,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        mediaUrl: data.mediaUrl || null,
      }
    });
    return { success: true, foodItem };
  } catch (error) {
    console.error("Error adding food item:", error);
    return { success: false, error: "Failed to add food item" };
  }
}

// -- Nutrition Plans --
export async function getNutritionPlan(clientId: string) {
  try {
    const plan = await prisma.nutritionPlan.findFirst({
      where: { clientId },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            meals: {
              orderBy: { order: 'asc' },
              include: {
                foods: {
                  orderBy: { order: 'asc' },
                  include: { food: true }
                }
              }
            }
          }
        }
      }
    });
    return { success: true, plan };
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return { success: false, error: "Failed to fetch nutrition plan" };
  }
}

// Create or update full nutrition plan
export async function saveNutritionPlan(clientId: string, planData: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    // Basic upsert approach: delete old plan entirely and recreate
    await prisma.nutritionPlan.deleteMany({
      where: { clientId }
    });

    const newPlan = await prisma.nutritionPlan.create({
      data: {
        coachId: profile.id,
        clientId,
        name: "النظام الغذائي",
        days: {
          create: planData.days.map((day: any, i: number) => ({
            name: day.name || `اليوم ${i + 1}`,
            order: i,
            meals: {
              create: day.meals.map((meal: any, j: number) => ({
                name: meal.name || `وجبة ${j + 1}`,
                order: j,
                foods: {
                  create: meal.foods.map((mf: any, k: number) => ({
                    foodId: mf.foodId,
                    amount: mf.amount || "100g",
                    order: k
                  }))
                }
              }))
            }
          }))
        }
      }
    });

    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error("Error saving nutrition plan:", error);
    return { success: false, error: "Failed to save nutrition plan" };
  }
}

// Smart Clone (optional, useful later)
export async function cloneNutritionPlan(fromClientId: string, toClientId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const oldPlan = await prisma.nutritionPlan.findFirst({
      where: { clientId: fromClientId },
      include: {
        days: {
          include: {
            meals: {
              include: { foods: true }
            }
          }
        }
      }
    });

    if (!oldPlan) return { success: false, error: "Plan not found" };

    await prisma.nutritionPlan.deleteMany({ where: { clientId: toClientId } });

    const newPlan = await prisma.nutritionPlan.create({
      data: {
        coachId: profile.id,
        clientId: toClientId,
        name: oldPlan.name,
        days: {
          create: oldPlan.days.map(day => ({
            name: day.name,
            order: day.order,
            meals: {
              create: day.meals.map(meal => ({
                name: meal.name,
                order: meal.order,
                foods: {
                  create: meal.foods.map(mf => ({
                    foodId: mf.foodId,
                    amount: mf.amount,
                    order: mf.order
                  }))
                }
              }))
            }
          }))
        }
      }
    });

    revalidatePath(`/dashboard/clients/${toClientId}`);
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error("Error cloning nutrition plan:", error);
    return { success: false, error: "Failed to clone nutrition plan" };
  }
}

export async function getAllCoachNutritionPlans() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const plans = await prisma.nutritionPlan.findMany({
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
    console.error("Error fetching coach nutrition plans:", error);
    return { success: false, error: "Failed to fetch coach nutrition plans" };
  }
}

export async function getNutritionPlanById(planId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const plan = await prisma.nutritionPlan.findFirst({
      where: { 
        id: planId,
        coachId: profile.id 
      },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            meals: {
              orderBy: { order: 'asc' },
              include: {
                foods: {
                  orderBy: { order: 'asc' },
                  include: {
                    food: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!plan) return { success: false, error: "Plan not found" };

    return { success: true, plan };
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return { success: false, error: "Failed to fetch nutrition plan" };
  }
}
