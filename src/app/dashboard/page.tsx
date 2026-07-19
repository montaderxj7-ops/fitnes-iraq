"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Bell, Clock, CheckCircle2, ChevronLeft, Calendar, MessageSquare, Search, ArrowUpRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSettings } from "@/actions/settings";
import { getPendingTasks, completeTask } from "@/actions/tasks";
import { getDashboardStats } from "@/actions/dashboard";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";
import { AppointmentsWidget } from "@/components/dashboard/AppointmentsWidget";
import Link from "next/link";

// Tasks will be fetched dynamically
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardOverview() {
  const [settings, setSettings] = useState({
    coachName: "كابتن برو",
    coachAvatar: "",
    primaryColor: "#82c91e"
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    activeClients: 0,
    activeClientsTrend: "0",
    totalRevenue: "$0",
    revenueTrend: "0%",
    newClients: 0,
    newClientsTrend: "0",
  });
  
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch all data concurrently to reduce latency
      const [resSettings, resTasks, dynamicStats] = await Promise.all([
        getSettings(),
        getPendingTasks(),
        getDashboardStats()
      ]);

      if (resSettings.success && resSettings.settings) {
        setSettings({
          coachName: resSettings.settings.name || "كابتن برو",
          coachAvatar: resSettings.settings.image || "",
          primaryColor: resSettings.settings.primaryColor || "#82c91e"
        });
      }

      if (resTasks.success && resTasks.tasks) {
        setTasks(resTasks.tasks);
      }

      setStatsData(dynamicStats);
    }
    fetchData();

    // Auto-refresh every 1 minute
    const intervalId = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCompleteTask = async (id: string) => {
    // Optimistic update
    setTasks(tasks.filter(t => t.id !== id));
    await completeTask(id);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col xl:flex-row gap-8 min-h-full"
    >
      {/* Main Content Area (Left side in RTL) */}
      <div className="flex-1 space-y-8 flex flex-col">
        
        {/* Header (Glassmorphism) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111111]/80 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-visible">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          
          <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#82c91e]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3 tracking-tight">
              {settings.coachAvatar && (
                <img 
                  src={settings.coachAvatar} 
                  alt="Coach Avatar" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                />
              )}
              مرحباً، <span style={{ color: settings.primaryColor }}>{settings.coachName}</span> <span className="animate-wave origin-bottom-right inline-block">👋</span>
            </h1>
            <p className="text-gray-400 font-medium">كيف حالك اليوم؟ إليك نظرة سريعة على أداء عملك.</p>
          </div>

          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-300">
                {currentDate ? new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(currentDate) : "..."}
              </span>
            </div>

            <GlobalSearch />

            <NotificationsDropdown />
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "المشتركون النشطون", 
              value: statsData.activeClients.toString(), 
              increase: statsData.activeClientsTrend, 
              trend: "up", 
              icon: Users,
              chartPoints: "0,40 10,35 20,45 30,30 40,50 50,20 60,35",
              color: "text-[#82c91e]" 
            },
            { 
              title: "إجمالي الأرباح", 
              value: statsData.totalRevenue, 
              increase: statsData.revenueTrend, 
              trend: "up", 
              icon: DollarSign,
              chartPoints: "0,50 10,45 20,30 30,40 40,20 50,35 60,10",
              color: "text-blue-400" 
            },
            { 
              title: "مشتركون جدد", 
              value: statsData.newClients.toString(), 
              increase: statsData.newClientsTrend, 
              trend: "up", 
              icon: TrendingUp,
              chartPoints: "0,20 10,35 20,25 30,40 40,30 50,45 60,20",
              color: "text-orange-400" 
            },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-6 rounded-[32px] bg-[#111111]/60 backdrop-blur-xl border border-white/10 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(130,201,30,0.1)] transition-all"
            >
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-sm">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-400 mt-1">{stat.title}</p>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300")}>
                  <stat.icon className={cn("w-5 h-5 drop-shadow-[0_0_8px_currentColor]", stat.color)} />
                </div>
              </div>

              <div className="h-16 relative w-full mb-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 60 60" preserveAspectRatio="none">
                  <path 
                    d={`M ${stat.chartPoints}`} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={cn("drop-shadow-lg", stat.color)} 
                  />
                </svg>
              </div>

              <div className="flex items-center gap-2 text-sm bg-black/20 w-fit px-3 py-1.5 rounded-full border border-white/5">
                <span className="text-[#82c91e] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.increase}
                </span>
                <span className="text-gray-500">منذ الشهر الماضي</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tasks Section (Glassmorphism) */}
        <motion.div variants={itemVariants} className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 flex-1 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <span className="w-12 h-12 rounded-2xl bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20 shadow-[0_0_15px_rgba(130,201,30,0.15)]">
                <CheckCircle2 className="w-6 h-6 text-[#82c91e] drop-shadow-[0_0_5px_currentColor]" />
              </span>
              المهام العاجلة
            </h2>
            <Link href="/dashboard/tasks" className="text-sm text-[#82c91e] hover:text-[#93e022] font-bold flex items-center gap-1 bg-[#82c91e]/10 px-5 py-2.5 rounded-xl border border-[#82c91e]/20 transition-all hover:bg-[#82c91e]/20 hover:scale-105 active:scale-95">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 relative z-10">
            {tasks.length === 0 ? (
              <div className="col-span-1 md:col-span-2 flex items-center justify-center p-8 text-gray-500 bg-black/20 border border-white/5 rounded-[24px]">
                ليس لديك أي مهام عاجلة حالياً. أحسنت! 🎉
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  key={task.id} 
                  onClick={() => handleCompleteTask(task.id)}
                  className="p-6 rounded-[24px] bg-white/5 border border-white/10 hover:border-[#82c91e]/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(130,201,30,0.15)] transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden backdrop-blur-md"
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-1.5 h-full opacity-80",
                    task.status === 'urgent' ? "bg-[#82c91e] shadow-[0_0_10px_#82c91e]" : task.status === 'warning' ? "bg-orange-400 shadow-[0_0_10px_orange]" : "bg-blue-400 shadow-[0_0_10px_blue]"
                  )} />
                  <p className="text-gray-300 text-sm font-medium leading-relaxed group-hover:text-white transition-colors mb-5 pl-4">{task.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {task.time}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#82c91e] group-hover:border-[#82c91e] transition-all duration-300 shadow-lg">
                      <CheckCircle2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      {/* Right Sidebar Panel */}
      <motion.div variants={itemVariants} className="w-full xl:w-[380px] flex flex-col gap-8">
        
        {/* Appointments / Sessions Widget */}
        <div className="h-full">
          <AppointmentsWidget />
        </div>

      </motion.div>
    </motion.div>
  );
}
