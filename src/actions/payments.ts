"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getPayments() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, payments: [] };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, payments: [] };

    const payments = await prisma.payment.findMany({
      where: { coachId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      success: true,
      payments: payments.map(p => ({
        id: p.id.slice(-6).toUpperCase(), // Shorten ID for display e.g. TX1092
        client: p.clientName,
        package: p.packageName,
        amount: p.amount,
        method: p.method,
        status: p.status,
        date: new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(p.createdAt)
      }))
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, payments: [] };
  }
}
