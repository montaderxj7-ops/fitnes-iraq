"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function globalSearch(query: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "COACH") {
      return { success: false, error: "Unauthorized" };
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!coachProfile) {
      return { success: false, error: "Profile not found" };
    }

    if (!query || query.trim().length === 0) {
      return { success: true, clients: [], packages: [] };
    }

    const searchStr = query.trim();

    // Perform concurrent search for clients and packages
    const [clients, packages] = await Promise.all([
      prisma.client.findMany({
        where: {
          coachId: coachProfile.id,
          name: {
            contains: searchStr,
            mode: 'insensitive'
          }
        },
        take: 5,
        select: {
          id: true,
          name: true,
          package: true,
          status: true
        }
      }),
      prisma.package.findMany({
        where: {
          coachId: coachProfile.id,
          name: {
            contains: searchStr,
            mode: 'insensitive'
          }
        },
        take: 5,
        select: {
          id: true,
          name: true,
          price: true
        }
      })
    ]);

    return { 
      success: true, 
      clients, 
      packages 
    };

  } catch (error: any) {
    console.error("Search Error:", error);
    return { success: false, error: "Failed to perform search" };
  }
}
