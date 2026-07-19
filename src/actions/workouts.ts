'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendNotificationToClient } from './notifications';

// -- Exercises Library --
export async function getExercises() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const exercises = await prisma.exercise.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    
    // Seed default if empty
    if (exercises.length === 0) {
      return { success: true, exercises: [] };
    }

    return { success: true, exercises };
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return { success: false, error: "Failed to fetch exercises" };
  }
}

// Add new exercise
export async function addExercise(data: { name: string; targetMuscle: string; mediaUrl?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const exercise = await prisma.exercise.create({
      data: {
        coachId: profile.id,
        name: data.name,
        targetMuscle: data.targetMuscle,
        mediaUrl: data.mediaUrl || null,
        defaultSets: 3,
        defaultReps: 12
      }
    });
    return { success: true, exercise };
  } catch (error) {
    console.error("Error adding exercise:", error);
    return { success: false, error: "Failed to add exercise" };
  }
}

// -- Workout Plans --
export async function getWorkoutPlan(clientId: string) {
  try {
    const plan = await prisma.workoutPlan.findFirst({
      where: { clientId },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
              include: { exercise: true }
            }
          }
        }
      }
    });
    return { success: true, plan };
  } catch (error) {
    console.error("Error fetching plan:", error);
    return { success: false, error: "Failed to fetch plan" };
  }
}

// Create or update full workout plan
export async function saveWorkoutPlan(clientId: string, planData: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    // Basic upsert approach: delete old plan entirely and recreate to avoid complex diffing
    await prisma.workoutPlan.deleteMany({
      where: { clientId }
    });

    const newPlan = await prisma.workoutPlan.create({
      data: {
        coachId: profile.id,
        clientId,
        name: "النظام التدريبي",
        days: {
          create: planData.days.map((day: any, i: number) => ({
            name: day.name || `اليوم ${i + 1}`,
            order: i,
            exercises: {
              create: day.exercises.map((ex: any, j: number) => ({
                exerciseId: ex.exerciseId,
                sets: parseInt(ex.sets) || 3,
                reps: parseInt(ex.reps) || 12,
                targetRpe: ex.targetRpe ? parseFloat(ex.targetRpe) : null,
                targetRir: ex.targetRir ? parseFloat(ex.targetRir) : null,
                order: j
              }))
            }
          }))
        }
      }
    });

    // Send push notification
    await sendNotificationToClient(
      clientId,
      "تحديث الخطة التدريبية",
      "قام الكابتن بتحديث خطتك التدريبية، ادخل لمشاهدتها!",
      "workout"
    );

    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error("Error saving plan:", error);
    return { success: false, error: "Failed to save plan" };
  }
}

// Smart Clone
export async function cloneWorkoutPlan(fromClientId: string, toClientId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const oldPlan = await prisma.workoutPlan.findFirst({
      where: { clientId: fromClientId },
      include: {
        days: {
          include: {
            exercises: true
          }
        }
      }
    });

    if (!oldPlan) return { success: false, error: "Plan not found" };

    await prisma.workoutPlan.deleteMany({ where: { clientId: toClientId } });

    const newPlan = await prisma.workoutPlan.create({
      data: {
        coachId: profile.id,
        clientId: toClientId,
        name: oldPlan.name,
        days: {
          create: oldPlan.days.map(day => ({
            name: day.name,
            order: day.order,
            exercises: {
              create: day.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                targetRpe: ex.targetRpe,
                targetRir: ex.targetRir,
                order: ex.order
              }))
            }
          }))
        }
      }
    });

    revalidatePath(`/dashboard/clients/${toClientId}`);
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error("Error cloning plan:", error);
    return { success: false, error: "Failed to clone plan" };
  }
}

export async function getAllCoachWorkoutPlans() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const plans = await prisma.workoutPlan.findMany({
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
    console.error("Error fetching coach plans:", error);
    return { success: false, error: "Failed to fetch coach plans" };
  }
}

export async function getWorkoutPlanById(planId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const plan = await prisma.workoutPlan.findFirst({
      where: { 
        id: planId,
        coachId: profile.id 
      },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
              include: {
                exercise: true
              }
            }
          }
        }
      }
    });

    if (!plan) return { success: false, error: "Plan not found" };

    return { success: true, plan };
  } catch (error) {
    console.error("Error fetching plan:", error);
    return { success: false, error: "Failed to fetch plan" };
  }
}
