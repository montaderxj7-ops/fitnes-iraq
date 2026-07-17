"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type DynamicNotification = {
  id: string;
  title: string;
  message: string;
  type: "NEW_SUBSCRIBER" | "EXPIRING_SOON" | "EXPIRED" | "INFO";
  link: string;
  createdAt: Date;
  isRead?: boolean;
};

export async function getDynamicNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "COACH") {
      return { success: false, error: "Unauthorized" };
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!coachProfile) {
      return { success: false, error: "Profile not found" };
    }

    const now = new Date();
    // 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    // 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Fetch clients that are either new (created in last 7 days) OR expiring/expired recently
    const clients = await prisma.client.findMany({
      where: {
        coachId: coachProfile.id,
        OR: [
          { startDate: { gte: sevenDaysAgo } }, // new subscribers
          { endDate: { gte: sevenDaysAgo, lte: threeDaysFromNow } } // expiring or recently expired
        ]
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      }
    });

    const notifications: DynamicNotification[] = [];

    for (const client of clients) {
      // Check for New Subscriber
      if (client.startDate >= sevenDaysAgo) {
        notifications.push({
          id: `new-${client.id}`,
          title: "مشترك جديد",
          message: `انضم المتدرب ${client.name} إلى باقتك حديثاً!`,
          type: "NEW_SUBSCRIBER",
          link: `/dashboard/clients/${client.id}`,
          createdAt: client.startDate
        });
      }

      if (client.endDate) {
        // Check for Expired
        if (client.endDate < now && client.endDate >= sevenDaysAgo) {
          notifications.push({
            id: `exp-${client.id}`,
            title: "اشتراك منتهي",
            message: `انتهى اشتراك المتدرب ${client.name}.`,
            type: "EXPIRED",
            link: `/dashboard/clients/${client.id}`,
            createdAt: client.endDate
          });
        }
        // Check for Expiring Soon
        else if (client.endDate >= now && client.endDate <= threeDaysFromNow) {
          notifications.push({
            id: `soon-${client.id}`,
            title: "اقتراب انتهاء الاشتراك",
            message: `اشتراك المتدرب ${client.name} سينتهي قريباً (خلال 3 أيام أو أقل).`,
            type: "EXPIRING_SOON",
            link: `/dashboard/clients/${client.id}`,
            createdAt: new Date(client.endDate.getTime() - 3 * 24 * 60 * 60 * 1000) // pseudo date 3 days before expiry
          });
        }
      }
    }

    // Sort by createdAt descending
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { success: true, notifications };
  } catch (error) {
    console.error("Failed to fetch dynamic notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}
