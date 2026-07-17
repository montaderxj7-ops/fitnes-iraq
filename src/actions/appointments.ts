"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getAppointments(dateStr?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    let dateFilter = {};
    if (dateStr) {
      // Find appointments for a specific day
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      
      dateFilter = {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        coachId: profile.id,
        ...dateFilter
      },
      orderBy: {
        date: 'asc'
      }
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { success: false, error: "Failed to fetch appointments" };
  }
}

export async function createAppointment(data: {
  title: string;
  date: Date;
  clientId?: string;
  clientName?: string;
  duration?: number;
  notes?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        coachId: profile.id
      }
    });

    revalidatePath("/dashboard");
    return { success: true, appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: "Failed to create appointment" };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    
    await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { success: false, error: "Failed to update appointment" };
  }
}

export async function deleteAppointment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    
    await prisma.appointment.delete({
      where: { id }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return { success: false, error: "Failed to delete appointment" };
  }
}

export async function editAppointment(id: string, data: {
  title: string;
  date: Date;
  clientName?: string;
  duration?: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data
      }
    });

    revalidatePath("/dashboard");
    return { success: true, appointment };
  } catch (error) {
    console.error("Error editing appointment:", error);
    return { success: false, error: "Failed to edit appointment" };
  }
}
