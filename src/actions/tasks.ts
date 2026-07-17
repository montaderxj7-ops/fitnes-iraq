'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Fetch all pending tasks
export async function getPendingTasks() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const tasks = await prisma.task.findMany({
      where: { coachId: profile.id, isCompleted: false },
      orderBy: { createdAt: 'desc' },
    });
    
    return { success: true, tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

// Fetch ALL tasks (pending and completed)
export async function getAllTasks() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const tasks = await prisma.task.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
    
    return { success: true, tasks };
  } catch (error) {
    console.error("Error fetching all tasks:", error);
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
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error("Error completing task:", error);
    return { success: false, error: "Failed to complete task" };
  }
}

// Mark task as uncompleted
export async function uncompleteTask(id: string) {
  try {
    await prisma.task.update({
      where: { id },
      data: { isCompleted: false }
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error("Error uncompleting task:", error);
    return { success: false, error: "Failed to uncomplete task" };
  }
}

// Delete task
export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id }
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

// Create a new task
export async function createTask(data: { text: string; time: string; status: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const task = await prisma.task.create({
      data: {
        ...data,
        coachId: profile.id
      }
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/tasks');
    return { success: true, task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}
