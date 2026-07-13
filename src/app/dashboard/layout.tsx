import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Authentication check
  const settings = await prisma.coachProfile.findFirst();
  if (settings?.dashboardLoginEnabled) {
    const cookieStore = await cookies();
    if (cookieStore.get("coach_auth")?.value !== "true") {
      redirect("/login");
    }
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
