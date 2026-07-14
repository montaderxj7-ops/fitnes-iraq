import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Authentication check
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "COACH") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto pr-[120px]">
        <div className="p-8 max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
