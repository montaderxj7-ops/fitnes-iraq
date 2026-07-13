'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch all pending tasks
export async function getPendingTasks() {
  try {
    const tasks = await prisma.task.findMany({
      where: { isCompleted: false },
      orderBy: { createdAt: 'desc' },
    });
    
    if (tasks.length === 0) {
      return { success: true, tasks: [] };
    }

    return { success: true, tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

// Mark task as completed
export async function completeTask(id: string) {
  try {
    await prisma.task.update({
      where: { id },
      data: { isCompleted: true }
    });
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error completing task:", error);
    return { success: false, error: "Failed to complete task" };
  }
}

// Create a new task (for future use)
export async function createTask(data: { text: string; time: string; status: string }) {
  try {
    const task = await prisma.task.create({
      data
    });
    
    revalidatePath('/dashboard');
    return { success: true, task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}
