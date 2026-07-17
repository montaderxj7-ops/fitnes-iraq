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
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1a1f1a]/80 backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 relative shadow-2xl z-50">
          <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
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
              className="p-6 rounded-[32px] bg-[#1a1f1a] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-400 mt-1">{stat.title}</p>
                </div>
                <div className={cn("w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shadow-inner border border-white/5")}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
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

        {/* Tasks Section */}
        <motion.div variants={itemVariants} className="bg-[#1a1f1a] border border-white/5 rounded-[32px] p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#82c91e]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#82c91e]" />
              </span>
              المهام العاجلة
            </h2>
            <Link href="/dashboard/tasks" className="text-sm text-[#82c91e] hover:text-[#93e022] font-medium flex items-center gap-1 bg-[#82c91e]/10 px-4 py-2 rounded-full transition-colors">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {tasks.length === 0 ? (
              <div className="col-span-1 md:col-span-2 flex items-center justify-center p-8 text-gray-500 bg-black/20 border border-white/5 rounded-[24px]">
                ليس لديك أي مهام عاجلة حالياً. أحسنت! 🎉
              </div>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => handleCompleteTask(task.id)}
                  className="p-5 rounded-[24px] bg-black/20 border border-white/5 hover:border-[#82c91e]/30 hover:bg-black/40 hover:shadow-[0_0_15px_rgba(130,201,30,0.1)] transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-1 h-full",
                    task.status === 'urgent' ? "bg-[#82c91e]" : task.status === 'warning' ? "bg-orange-400" : "bg-blue-400"
                  )} />
                  <p className="text-gray-300 text-sm font-medium leading-relaxed group-hover:text-white transition-colors mb-4">{task.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {task.time}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#82c91e] transition-all">
                      <CheckCircle2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
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
