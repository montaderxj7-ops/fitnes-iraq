'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// -- Exercises Library --
export async function getExercises() {
  try {
    const exercises = await prisma.exercise.findMany({
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
    const exercise = await prisma.exercise.create({
      data: {
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
    // Basic upsert approach: delete old plan entirely and recreate to avoid complex diffing
    await prisma.workoutPlan.deleteMany({
      where: { clientId }
    });

    const newPlan = await prisma.workoutPlan.create({
      data: {
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
                order: j
              }))
            }
          }))
        }
      }
    });

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
