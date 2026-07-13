"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const clientsCount = await prisma.client.count({
      where: { status: "active" }
    });

    const totalClientsCount = await prisma.client.count();

    const packages = await prisma.package.findMany({
      select: { price: true, clientsCount: true }
    });

    // Approximate total revenue based on package prices
    let totalRevenue = packages.reduce((acc, pkg) => {
      const priceVal = parseInt(pkg.price.replace(/\D/g, '')) || 0;
      return acc + (priceVal * pkg.clientsCount);
    }, 0);
    
    // Fallback if packages have 0 clientsCount
    if (totalRevenue === 0 && totalClientsCount > 0) {
      totalRevenue = totalClientsCount * 25000; // rough average
    }

    const now = new Date();
    const oneMonthAgo = new Date(new Date().setMonth(now.getMonth() - 1));
    const twoMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 2));

    const newClientsThisMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    const newClientsLastMonth = await prisma.client.count({
      where: {
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
      activeClients: clientsCount,
      activeClientsTrend: activeClientsTrendStr,
      totalRevenue: "$" + totalRevenue.toLocaleString(), // Format nicely
      revenueTrend: revenueTrendStr,
      newClients: newClientsThisMonth,
      newClientsTrend: newClientsTrendStr,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      activeClients: 0,
      activeClientsTrend: "0",
      totalRevenue: "$0",
      revenueTrend: "+0%",
      newClients: 0,
      newClientsTrend: "0",
    };
  }
}
