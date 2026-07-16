"use server";

import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return getDefaultStats();
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return getDefaultStats();

    const coachId = profile.id;

    const clientsCount = await prisma.client.count({
      where: { status: "active", coachId }
    });

    const totalClientsCount = await prisma.client.count({
      where: { coachId }
    });

    const payments = await prisma.payment.findMany({
      where: { coachId, status: "completed" },
      select: { amount: true }
    });

    const totalRevenue = payments.reduce((acc, p) => {
      const priceVal = parseInt(p.amount.replace(/\D/g, '')) || 0;
      return acc + priceVal;
    }, 0);

    const now = new Date();
    const oneMonthAgo = new Date(new Date().setMonth(now.getMonth() - 1));
    const twoMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 2));

    const newClientsThisMonth = await prisma.client.count({
      where: {
        coachId,
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    const newClientsLastMonth = await prisma.client.count({
      where: {
        coachId,
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo
        }
      }
    });

    const activeClientsTrendStr = newClientsThisMonth > 0 ? `+${newClientsThisMonth}` : "0";
    
    const newClientsTrend = newClientsThisMonth - newClientsLastMonth;
    const newClientsTrendStr = newClientsTrend > 0 ? `+${newClientsTrend}` : `${newClientsTrend}`;

    const revenueTrendPct = totalClientsCount > 0 ? Math.round((newClientsThisMonth / totalClientsCount) * 100) : 0;
    const revenueTrendStr = `+${revenueTrendPct}%`;

    return {
      activeClients: totalClientsCount,
      activeClientsTrend: `+${newClientsThisMonth}`,
      totalRevenue: `${totalRevenue.toLocaleString()} IQD`,
      revenueTrend: "+100%",
      newClients: newClientsThisMonth,
      newClientsTrend: newClientsTrendStr,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return getDefaultStats();
  }
}

function getDefaultStats() {
  return {
    activeClients: 0,
    activeClientsTrend: "0",
    totalRevenue: "0 IQD",
    revenueTrend: "+0%",
    newClients: 0,
    newClientsTrend: "0",
  };
}
