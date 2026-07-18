"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Users, MessageSquare, Package, CreditCard, Settings, Component } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { logoutCoach } from "@/actions/auth";

const MENU_ITEMS = [
  { path: "/dashboard", icon: LayoutGrid },
  { path: "/dashboard/clients", icon: Users },
  { path: "/dashboard/inbox", icon: MessageSquare },
  { path: "/dashboard/packages", icon: Package },
  { path: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-6 top-6 bottom-6 w-[72px] z-50">
      {/* Floating Pill Container (Glassmorphism) */}
      <div className="w-full h-full bg-[#111111]/80 backdrop-blur-2xl rounded-[40px] flex flex-col items-center py-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] justify-between border border-white/10 relative overflow-hidden">
        
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />

        {/* Top Section */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-[#82c91e] flex items-center justify-center shadow-[0_0_20px_rgba(130,201,30,0.3)] mb-4 border border-white/20">
            <Component className="w-6 h-6 text-[#1a1f1a] fill-current" />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className="relative group flex items-center justify-center w-12 h-12 outline-none"
                >
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-2xl transition-colors",
                      isActive ? "bg-[#82c91e]/10 shadow-[inset_0_0_15px_rgba(130,201,30,0.2)] border border-[#82c91e]/30" : "bg-white/0 group-hover:bg-white/5 border border-transparent"
                    )}
                    layoutId={isActive ? "activeNav" : undefined}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <item.icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-300", 
                        isActive ? "text-[#82c91e] drop-shadow-[0_0_8px_rgba(130,201,30,0.8)]" : "text-gray-400 group-hover:text-white"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
        {/* Bottom Actions */}
        <div className="relative z-10 w-12 p-1 bg-black/40 backdrop-blur-md rounded-[20px] flex flex-col items-center gap-1 border border-white/10 shadow-inner">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => logoutCoach()}
            className="w-10 h-10 rounded-[16px] flex items-center justify-center transition-all bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            title="تسجيل الخروج"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </motion.button>
        </div>

      </div>
    </aside>
  );
}
