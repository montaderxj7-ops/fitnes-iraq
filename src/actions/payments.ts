"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  try {
    const payments = await prisma.payment.findMany({
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
