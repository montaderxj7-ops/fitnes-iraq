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
      {/* Floating Pill Container */}
      <div className="w-full h-full bg-[#272d27] rounded-[36px] flex flex-col items-center py-6 shadow-2xl justify-between border border-white/5">
        
        {/* Top Section */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-12 h-12 rounded-full bg-[#82c91e] flex items-center justify-center shadow-lg shadow-[#82c91e]/20 mb-4">
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
                  className="relative group flex items-center justify-center w-12 h-12"
                >
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full transition-colors",
                      isActive ? "bg-[#82c91e] shadow-lg shadow-[#82c91e]/20" : "bg-white/5 group-hover:bg-white/10"
                    )}
                    layoutId={isActive ? "activeNav" : undefined}
                  />
                  <item.icon 
                    className={cn(
                      "w-5 h-5 relative z-10 transition-colors", 
                      isActive ? "text-[#1a1f1a]" : "text-gray-400 group-hover:text-white"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </Link>
              );
            })}
          </div>
        </div>
        {/* Bottom Actions */}
        <div className="w-12 p-1 bg-black/20 rounded-full flex flex-col items-center gap-1 border border-white/5 shadow-inner">
          <button 
            onClick={() => logoutCoach()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-red-500/10 hover:bg-red-500/20 border border-white/10"
            title="تسجيل الخروج"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </aside>
  );
}
