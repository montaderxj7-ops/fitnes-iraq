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
      select: { amount: true, createdAt: true }
    });

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    let totalRevenue = 0;
    let revenueThisMonth = 0;
    let revenueLastMonth = 0;

    for (const p of payments) {
      const priceVal = parseInt(p.amount.replace(/\D/g, '')) || 0;
      totalRevenue += priceVal;

      if (p.createdAt >= oneMonthAgo) {
        revenueThisMonth += priceVal;
      } else if (p.createdAt >= twoMonthsAgo && p.createdAt < oneMonthAgo) {
        revenueLastMonth += priceVal;
      }
    }

    const newClientsThisMonth = await prisma.client.count({
      where: {
        coachId,
        createdAt: { gte: oneMonthAgo }
      }
    });

    const newClientsLastMonth = await prisma.client.count({
      where: {
        coachId,
        createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
      }
    });

    // Trends logic
    const activeClientsTrendStr = newClientsThisMonth > 0 ? `+${newClientsThisMonth}` : "0";
    
    const newClientsTrend = newClientsThisMonth - newClientsLastMonth;
    const newClientsTrendStr = newClientsTrend > 0 ? `+${newClientsTrend}` : newClientsTrend === 0 ? "0" : `${newClientsTrend}`;

    let revenueTrendPct = 0;
    if (revenueLastMonth > 0) {
      revenueTrendPct = Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);
    } else if (revenueThisMonth > 0) {
      revenueTrendPct = 100;
    }
    const revenueTrendStr = revenueTrendPct > 0 ? `+${revenueTrendPct}%` : `${revenueTrendPct}%`;

    return {
      activeClients: clientsCount,
      activeClientsTrend: activeClientsTrendStr,
      totalRevenue: `${totalRevenue.toLocaleString('en-US')} IQD`,
      revenueTrend: revenueTrendStr,
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
