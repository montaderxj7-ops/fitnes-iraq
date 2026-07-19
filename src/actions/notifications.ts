'use server';

import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

export interface DynamicNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: Date | string;
  link: string;
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDynamicNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return { success: false, notifications: [] };
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!coachProfile) {
      return { success: false, notifications: [] };
    }

    const clients = await prisma.client.findMany({
      where: { coachId: coachProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const notifications: DynamicNotification[] = [];

    clients.forEach(client => {
      // New Client Notification
      const daysSinceCreation = (Date.now() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 3) {
        notifications.push({
          id: `new-${client.id}`,
          type: 'NEW_SUBSCRIBER',
          title: 'مشترك جديد',
          message: `تم انضمام ${client.name} مؤخراً.`,
          createdAt: client.createdAt,
          link: `/dashboard/clients/${client.id}`
        });
      }

      // Expiring Soon Notification
      if (client.subscriptionEnd) {
        const daysUntilExpiry = (new Date(client.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 5) {
          notifications.push({
            id: `expiring-${client.id}`,
            type: 'EXPIRING_SOON',
            title: 'اشتراك يشارف على الانتهاء',
            message: `اشتراك ${client.name} سينتهي خلال ${Math.ceil(daysUntilExpiry)} أيام.`,
            createdAt: new Date(Date.now() - 1000 * 60 * 60), // Mock recent time
            link: `/dashboard/clients/${client.id}`
          });
        } else if (daysUntilExpiry <= 0) {
          notifications.push({
            id: `expired-${client.id}`,
            type: 'EXPIRED',
            title: 'اشتراك منتهي',
            message: `لقد انتهى اشتراك ${client.name}.`,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Mock recent time
            link: `/dashboard/clients/${client.id}`
          });
        }
      }
    });

    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, notifications: notifications.slice(0, 50) };
  } catch (error) {
    console.error('Error fetching dynamic notifications:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function getNotifications(clientId: string) {
  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.userId) return { success: false, error: 'Client not found or has no user' };

    const notifications = await prisma.notification.findMany({
      where: { userId: client.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function savePushSubscription(clientId: string, subscription: any) {
  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.userId) return { success: false, error: 'Client not found or has no user' };

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys) return { success: false, error: 'Invalid subscription data' };

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: client.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        userId: client.userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function sendNotificationToClient(clientId: string, title: string, message: string, type: string = 'info') {
  try {
    // 1. Fetch user ID from client ID
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true, coach: true },
    });

    if (!client || !client.userId) {
      return { success: false, error: 'Client not found or has no user' };
    }

    const userId = client.userId;

    // 2. Save in-app Notification
    const newNotification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    // 3. Send Web Push
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length > 0 && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:admin@gym-system.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );

      const coachSlug = client.coach?.slug;
      const validIcon = coachSlug ? `/api/logo/${coachSlug}` : '/log.png';

      const payload = JSON.stringify({
        title,
        body: message,
        icon: validIcon,
        url: `/${client.coach?.slug || 'app'}`,
      });

      const promises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription has expired or is no longer valid
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            console.error('Error sending push:', err);
          }
        }
      });

      await Promise.allSettled(promises);
    }

    return { success: true, notification: newNotification };
  } catch (error) {
    console.error('Error in sendNotificationToClient:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function sendTestNotification(clientId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client || !client.userId) {
      return { success: false, error: 'Client not found' };
    }

    const userId = client.userId;
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length > 0 && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:admin@gym-system.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );

      const payload = JSON.stringify({
        title: "✅ إشعار تجريبي",
        body: "ممتاز! نظام الإشعارات يعمل الآن على جهازك بنجاح.",
        icon: '/log.png',
        url: '/app',
      });

      await Promise.all(subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
        }
      }));

      return { success: true };
    }
    return { success: false, error: 'No subscriptions or VAPID keys missing' };
  } catch (error) {
    console.error('Test notification error:', error);
    return { success: false, error: 'Failed' };
  }
}
