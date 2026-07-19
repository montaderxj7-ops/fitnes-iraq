"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveExerciseLog(data: {
  clientId: string;
  workoutExerciseId: string;
  date: Date;
  sets: Array<{ setNumber: number; reps: number; weight: number; rpe?: number; rir?: number }>;
  notes?: string;
}) {
  try {
    const startOfDay = new Date(data.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(data.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await db.exerciseLog.findFirst({
      where: {
        clientId: data.clientId,
        workoutExerciseId: data.workoutExerciseId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Cast sets to any because Prisma Json is strict about types sometimes, 
    // but array of objects is fine.
    const setsJson = data.sets as any;

    if (existingLog) {
      await db.exerciseLog.update({
        where: { id: existingLog.id },
        data: {
          sets: setsJson,
          notes: data.notes
        }
      });
    } else {
      await db.exerciseLog.create({
        data: {
          clientId: data.clientId,
          workoutExerciseId: data.workoutExerciseId,
          date: data.date,
          sets: setsJson,
          notes: data.notes
        }
      });
    }

    revalidatePath(`/dashboard/clients/${data.clientId}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving exercise log:", error);
    return { success: false, error: "فشل في حفظ البيانات" };
  }
}

export async function getExerciseLogs(clientId: string, workoutExerciseId?: string) {
  try {
    const whereClause: any = { clientId };
    if (workoutExerciseId) {
      whereClause.workoutExerciseId = workoutExerciseId;
    }

    const logs = await db.exerciseLog.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        workoutExercise: {
          include: {
            exercise: true
          }
        }
      }
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Error fetching exercise logs:", error);
    return { success: false, error: "فشل في جلب البيانات" };
  }
}
