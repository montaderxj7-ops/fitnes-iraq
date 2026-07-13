"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function loginCoach(email?: string, password?: string) {
  const settings = await prisma.settings.findFirst();
  
  if (!settings || !settings.dashboardLoginEnabled) {
    // If login is not enabled, they shouldn't even be here, but just in case:
    const cookieStore = await cookies();
    cookieStore.set("coach_auth", "true", { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  }

  // Check email and password against settings
  if (
    settings.dashboardEmail === email && 
    settings.dashboardPassword === password
  ) {
    const cookieStore = await cookies();
    cookieStore.set("coach_auth", "true", { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  }
  
  return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
}

export async function logoutCoach() {
  const cookieStore = await cookies();
  cookieStore.delete("coach_auth");
  redirect("/");
}
