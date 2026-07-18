'use server';

import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

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
      include: { user: true },
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

      const payload = JSON.stringify({
        title,
        body: message,
        icon: '/logos/icon.png',
        url: '/app',
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
