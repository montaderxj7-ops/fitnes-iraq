"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getClients() {
  try {
    let clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (clients.length === 0) {
      return [];
    }
    
    // Map dates nicely
    return clients.map(client => ({
      ...client,
      expiry: new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(new Date(client.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000))
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function getClientById(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) return { success: false, error: "Client not found" };

    return { 
      success: true, 
      client: {
        ...client,
        expiry: client.createdAt ? new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(new Date(client.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000)) : "غير محدد"
      } 
    };
  } catch (error) {
    console.error("Error fetching client:", error);
    return { success: false, error: "Failed to fetch client" };
  }
}

export async function addClient(data: {
  name: string;
  email?: string;
  password?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  injuries?: string;
  package: string;
  status?: string;
  avatar?: string;
  paymentMethod?: string;
}) {
  try {
    // Fetch session first since we need coachId for Task and Payment
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const profile = await prisma.coachProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "No profile" };

    // Create User for the client
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email || `${Date.now()}@client.local`,
        password: data.password || "123456",
        role: "CLIENT",
      }
    });

    const newClient = await prisma.client.create({
      data: {
        userId: user.id,
        coachId: profile.id,
        name: data.name,
        age: data.age,
        weight: data.weight,
        height: data.height,
        goal: data.goal,
        injuries: data.injuries,
        package: data.package,
        status: data.status || "active",
      },
    });



    // Create a corresponding task automatically
    await prisma.task.create({
      data: {
        coachId: profile.id,
        text: `${data.name} اشترك للتو في ${data.package}، بانتظار إضافة الخطة.`,
        time: new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date()),
        status: "urgent",
        isCompleted: false
      }
    });

    // Fetch package price for the payment record
    const pkg = await prisma.package.findFirst({
      where: { name: data.package }
    });
    const priceStr = pkg ? pkg.price.replace(/\D/g, '') : "25000";

    // Create a corresponding payment record
    await prisma.payment.create({
      data: {
        coachId: profile.id,
        clientName: data.name,
        packageName: data.package,
        amount: Number(priceStr).toLocaleString(),
        method: data.paymentMethod || "زين كاش",
        status: "completed"
      }
    });
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard");
    return { success: true, client: newClient };
  } catch (error) {
    console.error("Error adding client:", error);
    return { success: false, error: "Failed to add client" };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: "Failed to delete client" };
  }
}

export async function loginClient(email: string, password?: string) {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { clientProfile: true }
    });
    if (!user || !user.clientProfile) {
      return { success: false, error: "البريد الإلكتروني غير مسجل" };
    }
    // In a real app, use bcrypt. Here we do simple check.
    if (user.password !== password) {
      return { success: false, error: "كلمة المرور غير صحيحة" };
    }
    return { success: true, client: { ...user.clientProfile, email: user.email } };
  } catch (error) {
    console.error("Error logging in client:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}
