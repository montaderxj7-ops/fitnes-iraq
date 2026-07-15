"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function forceLoginCoach() {
  const cookieStore = await cookies();
  cookieStore.set("coach_auth", "true", { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
  return { success: true };
}

export async function registerCoach(data: { name: string; email: string; password: string }) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "") || `coach-${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "COACH",
        coachProfile: {
          create: {
            name: data.name,
            slug: slug,
            specialty: "مدرب شخصي",
            bio: "مرحباً بك في فريقي!",
            instagram: "",
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error registering coach:", error);
    return { success: false, error: "حدث خطأ أثناء التسجيل" };
  }
}

export async function markCoachAsPaid(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    const slug = user.name ? user.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "") : `coach-${Date.now()}`;

    await prisma.coachProfile.upsert({
      where: { userId },
      update: { hasPaid: true },
      create: {
        userId,
        name: user.name || "كابتن",
        slug: slug || `coach-${Date.now()}`,
        specialty: "مدرب شخصي",
        bio: "مرحباً بك في فريقي!",
        instagram: "",
        hasPaid: true
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking coach as paid:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

export async function logoutCoach() {
  const cookieStore = await cookies();
  cookieStore.delete("coach_auth");
  cookieStore.delete("next-auth.session-token");
  redirect("/");
}
